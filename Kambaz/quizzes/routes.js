import QuizzesDao from "./dao.js";
import QuizAttemptsDao from "../quizAttempts/dao.js";
import EnrollmentsDao from "../enrollments/dao.js";
import CoursesDao from "../courses/dao.js";

const FACULTY_ROLES = new Set(["FACULTY", "ADMIN", "TA"]);

function isFaculty(user) {
  return user && FACULTY_ROLES.has(user.role);
}

function seesPublishedQuizzesOnly(user) {
  return user && !FACULTY_ROLES.has(user.role);
}

function sanitizeQuestion(q) {
  const o = { ...q };
  delete o.correctMcChoiceId;
  delete o.correctMcChoiceIds;
  delete o.correctTrueFalse;
  delete o.fibCorrectAnswers;
  if (Array.isArray(o.fibBlanks)) {
    o.fibBlanks = o.fibBlanks.map((b) => ({ _id: b._id }));
  }
  return o;
}

function sanitizeQuiz(quiz) {
  if (!quiz) return quiz;
  const copy = { ...quiz, questions: (quiz.questions || []).map(sanitizeQuestion) };
  return copy;
}

export default function QuizRoutes(app, db) {
  const dao = QuizzesDao();
  const attemptsDao = QuizAttemptsDao();
  const enrollmentsDao = EnrollmentsDao(db);
  const coursesDao = CoursesDao();

  async function assertCourseAccess(req, res, courseId) {
    const user = req.session?.currentUser;
    if (!user) {
      res.sendStatus(401);
      return false;
    }
    const enrolled = await enrollmentsDao.isUserEnrolledInCourse(
      user._id,
      courseId,
    );
    if (!enrolled) {
      res.sendStatus(403);
      return false;
    }
    return true;
  }

  async function assertCourseAuthor(req, res, courseId) {
    const user = req.session?.currentUser;
    if (!user) {
      res.sendStatus(401);
      return false;
    }
    const course = await coursesDao.findCourseById(courseId);
    if (!course) {
      res.sendStatus(404);
      return false;
    }
    if (String(course.author) !== String(user._id) && user.role !== "ADMIN") {
      res.status(403).json({ message: "Only the course author may edit quizzes." });
      return false;
    }
    return true;
  }

  const findQuizzesForCourse = async (req, res) => {
    const { courseId } = req.params;
    if (!(await assertCourseAccess(req, res, courseId))) return;
    const user = req.session.currentUser;
    let list = await dao.findQuizzesForCourse(courseId);
    if (seesPublishedQuizzesOnly(user)) {
      list = list.filter((q) => q.published);
    }
    const out = [];
    for (const q of list) {
      const totalPoints = dao.sumQuestionPoints(q.questions);
      const last = await attemptsDao.findLastAttempt(user._id, q._id);
      out.push({
        _id: q._id,
        course: q.course,
        title: q.title,
        published: q.published,
        dueDate: q.dueDate,
        availableDate: q.availableDate,
        untilDate: q.untilDate,
        questionCount: (q.questions || []).length,
        points: totalPoints,
        lastScore: last ? last.score : null,
        lastMaxScore: last ? last.maxScore : null,
      });
    }
    res.json(out);
  };

  const findQuizById = async (req, res) => {
    const { quizId } = req.params;
    const quiz = await dao.findQuizById(quizId);
    if (!quiz) {
      res.sendStatus(404);
      return;
    }
    if (!(await assertCourseAccess(req, res, quiz.course))) return;
    const user = req.session.currentUser;
    if (seesPublishedQuizzesOnly(user) && !quiz.published) {
      res.sendStatus(403);
      return;
    }
    if (isFaculty(user)) {
      res.json(quiz);
      return;
    }
    res.json(sanitizeQuiz(quiz));
  };

  const createQuiz = async (req, res) => {
    const { courseId } = req.params;
    if (!(await assertCourseAuthor(req, res, courseId))) return;
    const created = await dao.createQuiz(courseId, req.body);
    res.json(created);
  };

  const updateQuiz = async (req, res) => {
    const { quizId } = req.params;
    const existing = await dao.findQuizById(quizId);
    if (!existing) {
      res.sendStatus(404);
      return;
    }
    if (!(await assertCourseAuthor(req, res, existing.course))) return;
    const updated = await dao.updateQuiz(quizId, req.body);
    res.json(updated);
  };

  const deleteQuiz = async (req, res) => {
    const { quizId } = req.params;
    const existing = await dao.findQuizById(quizId);
    if (!existing) {
      res.sendStatus(404);
      return;
    }
    if (!(await assertCourseAuthor(req, res, existing.course))) return;
    await attemptsDao.deleteAttemptsForQuiz(quizId);
    await dao.deleteQuiz(quizId);
    res.sendStatus(204);
  };

  const getLastAttempt = async (req, res) => {
    const { quizId } = req.params;
    const quiz = await dao.findQuizById(quizId);
    if (!quiz) {
      res.sendStatus(404);
      return;
    }
    if (!(await assertCourseAccess(req, res, quiz.course))) return;
    const user = req.session.currentUser;
    const last = await attemptsDao.findLastAttempt(user._id, quizId);
    res.json(last || null);
  };

  const submitAttempt = async (req, res) => {
    const { quizId } = req.params;
    const quiz = await dao.findQuizById(quizId);
    if (!quiz) {
      res.sendStatus(404);
      return;
    }
    if (!(await assertCourseAccess(req, res, quiz.course))) return;
    const user = req.session.currentUser;
    const isPreview = Boolean(req.body.preview);

    if (isPreview) {
      if (!isFaculty(user)) {
        res.status(403).json({ message: "Only faculty can preview graded results." });
        return;
      }
      const { score, maxScore, results } = dao.gradeAnswers(
        quiz,
        req.body.answers,
      );
      res.json({
        preview: true,
        score,
        maxScore,
        results,
        answers: req.body.answers,
      });
      return;
    }

    if (isFaculty(user)) {
      res.status(403).json({ message: "Faculty attempts are preview-only." });
      return;
    }
    if (!quiz.published) {
      res.sendStatus(403);
      return;
    }
    if (quiz.accessCode && quiz.accessCode !== req.body.accessCode) {
      res.status(403).json({ message: "Invalid access code." });
      return;
    }
    const n = await attemptsDao.countAttempts(user._id, quizId);
    const allowed = quiz.multipleAttempts ? quiz.howManyAttempts || 1 : 1;
    if (n >= allowed) {
      res.status(400).json({ message: "No attempts remaining." });
      return;
    }
    const { score, maxScore, results } = dao.gradeAnswers(quiz, req.body.answers);
    const attemptNumber = n + 1;
    const saved = await attemptsDao.createAttempt({
      user: user._id,
      quiz: quizId,
      course: quiz.course,
      attemptNumber,
      answers: req.body.answers,
      score,
      maxScore,
      results,
    });
    res.json(saved);
  };

  app.get("/api/courses/:courseId/quizzes", findQuizzesForCourse);
  app.post("/api/courses/:courseId/quizzes", createQuiz);
  app.get("/api/quizzes/:quizId", findQuizById);
  app.put("/api/quizzes/:quizId", updateQuiz);
  app.delete("/api/quizzes/:quizId", deleteQuiz);
  app.get("/api/quizzes/:quizId/attempts/last", getLastAttempt);
  app.post("/api/quizzes/:quizId/attempts", submitAttempt);
}
