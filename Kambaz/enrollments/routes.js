import EnrollmentsDao from "./dao.js";

export default function EnrollmentRoutes(app, db) {
  const dao = EnrollmentsDao(db);

  const findEnrollmentsForUser = (req, res) => {
    const { userId } = req.params;
    res.json(dao.findEnrollmentsForUser(userId));
  };

  const enroll = (req, res) => {
    const { user, course } = req.body;
    const created = dao.enrollUserInCourse(user, course);
    if (!created) {
      res.status(400).json({ message: "Already enrolled" });
      return;
    }
    res.json(created);
  };

  const unenroll = (req, res) => {
    const { user, course } = req.body;
    const removed = dao.unenrollUserFromCourse(user, course);
    if (!removed) {
      res.sendStatus(404);
      return;
    }
    res.sendStatus(204);
  };

  app.get("/api/users/:userId/enrollments", findEnrollmentsForUser);
  app.post("/api/enrollments", enroll);
  app.delete("/api/enrollments", unenroll);
}
