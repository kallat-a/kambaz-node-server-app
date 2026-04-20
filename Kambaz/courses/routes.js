import CoursesDao from "./dao.js";
import EnrollmentsDao from "../enrollments/dao.js";
import AssignmentsDao from "../assignments/dao.js";
import QuizzesDao from "../quizzes/dao.js";
import QuizAttemptsDao from "../quizAttempts/dao.js";

export default function CourseRoutes(app, db) {
  const dao = CoursesDao();
  const enrollmentsDao = EnrollmentsDao(db);
  const assignmentsDao = AssignmentsDao(db);
  const quizzesDao = QuizzesDao();
  const quizAttemptsDao = QuizAttemptsDao();

  const findAllCourses = async (req, res) => {
    const courses = await dao.findAllCourses();
    res.json(courses);
  };

  const findCoursesTeaching = async (req, res) => {
    const sessionUser = req.session["currentUser"];
    if (!sessionUser) {
      res.sendStatus(401);
      return;
    }
    let { userId } = req.params;
    if (userId === "current") {
      userId = sessionUser._id;
    }
    if (String(sessionUser._id) !== String(userId)) {
      res.sendStatus(403);
      return;
    }
    const courses = await dao.findCoursesByAuthor(userId);
    res.json(courses);
  };

  const findCoursesForUser = async (req, res) => {
    let { userId } = req.params;
    if (userId === "current") {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      userId = currentUser._id;
    }
    const courses = await enrollmentsDao.findCoursesForUser(userId);
    res.json(courses);
  };

  const findUsersForCourse = async (req, res) => {
    const { courseId } = req.params;
    const users = await enrollmentsDao.findUsersForCourse(courseId);
    res.json(users);
  };

  const enrollUserInCourse = async (req, res) => {
    let { uid, cid } = req.params;
    if (uid === "current") {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      uid = currentUser._id;
    }
    const created = await enrollmentsDao.enrollUserInCourse(uid, cid);
    if (!created) {
      res.status(400).json({ message: "Already enrolled" });
      return;
    }
    res.json(created);
  };

  const unenrollUserFromCourse = async (req, res) => {
    let { uid, cid } = req.params;
    if (uid === "current") {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      uid = currentUser._id;
    }
    const removed = await enrollmentsDao.unenrollUserFromCourse(uid, cid);
    if (!removed) {
      res.sendStatus(404);
      return;
    }
    res.sendStatus(204);
  };

  const createCourse = async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    const payload = {
      ...req.body,
      author: req.body.author || currentUser._id,
    };
    const newCourse = await dao.createCourse(payload);
    await enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
    res.json(newCourse);
  };

  const updateCourse = async (req, res) => {
    const { courseId } = req.params;
    const existing = await dao.findCourseById(courseId);
    if (!existing) {
      res.sendStatus(404);
      return;
    }
    const updated = await dao.updateCourse(courseId, req.body);
    res.json(updated);
  };

  const deleteCourse = async (req, res) => {
    const { courseId } = req.params;
    await enrollmentsDao.unenrollAllUsersFromCourse(courseId);
    await quizAttemptsDao.deleteAttemptsForCourse(courseId);
    await quizzesDao.deleteQuizzesForCourse(courseId);
    await assignmentsDao.deleteAssignmentsForCourse(courseId);
    const status = await dao.deleteCourse(courseId);
    if (!status.deletedCount) {
      res.sendStatus(404);
      return;
    }
    res.sendStatus(204);
  };

  app.get("/api/courses", findAllCourses);
  app.get("/api/users/:userId/courses-teaching", findCoursesTeaching);
  app.get("/api/courses/:courseId/users", findUsersForCourse);
  app.get("/api/users/:userId/courses", findCoursesForUser);
  app.post("/api/users/:uid/courses/:cid", enrollUserInCourse);
  app.delete("/api/users/:uid/courses/:cid", unenrollUserFromCourse);
  app.post("/api/courses", createCourse);
  app.put("/api/courses/:courseId", updateCourse);
  app.delete("/api/courses/:courseId", deleteCourse);
}
