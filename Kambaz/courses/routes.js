import CoursesDao from "./dao.js";

export default function CourseRoutes(app, db) {
  const dao = CoursesDao(db);

  const findAllCourses = (req, res) => {
    res.json(dao.findAllCourses());
  };

  const findCoursesForUser = (req, res) => {
    res.json(dao.findCoursesForUser(req.params.userId));
  };

  const createCourse = (req, res) => {
    res.json(dao.createCourse(req.body));
  };

  const updateCourse = (req, res) => {
    const { courseId } = req.params;
    if (!dao.findCourseById(courseId)) {
      res.sendStatus(404);
      return;
    }
    res.json(dao.updateCourse(courseId, req.body));
  };

  const deleteCourse = (req, res) => {
    const ok = dao.deleteCourse(req.params.courseId);
    if (!ok) {
      res.sendStatus(404);
      return;
    }
    res.sendStatus(204);
  };

  app.get("/api/courses", findAllCourses);
  app.get("/api/users/:userId/courses", findCoursesForUser);
  app.post("/api/courses", createCourse);
  app.put("/api/courses/:courseId", updateCourse);
  app.delete("/api/courses/:courseId", deleteCourse);
}
