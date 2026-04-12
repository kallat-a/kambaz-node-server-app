import EnrollmentsDao from "./dao.js";

export default function EnrollmentRoutes(app, db) {
  const dao = EnrollmentsDao(db);

  const findEnrollmentsForUser = async (req, res) => {
    const { userId } = req.params;
    const list = await dao.findEnrollmentsForUser(userId);
    res.json(list);
  };

  app.get("/api/users/:userId/enrollments", findEnrollmentsForUser);
}
