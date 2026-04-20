import EnrollmentsDao from "./dao.js";

export default function EnrollmentRoutes(app, db) {
  const dao = EnrollmentsDao(db);

  const findEnrollmentsForUser = async (req, res) => {
    const { userId } = req.params;
    const list = await dao.findEnrollmentsForUser(userId);
    res.json(list);
  };

  const isEnrolledInCourse = async (req, res) => {
    let { userId, courseId } = req.params;
    if (userId === "current") {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      userId = currentUser._id;
    }
    const ok = await dao.isUserEnrolledInCourse(userId, courseId);
    res.json({ enrolled: ok });
  };

  app.get("/api/users/:userId/enrollments", findEnrollmentsForUser);
  app.get(
    "/api/users/:userId/courses/:courseId/enrolled",
    isEnrolledInCourse,
  );
}
