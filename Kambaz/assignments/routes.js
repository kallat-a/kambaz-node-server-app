import AssignmentsDao from "./dao.js";

export default function AssignmentRoutes(app, db) {
  const dao = AssignmentsDao(db);

  const findAllAssignments = (req, res) => {
    res.json(dao.findAllAssignments());
  };

  const findAssignmentsForCourse = (req, res) => {
    const { courseId } = req.params;
    res.json(dao.findAssignmentsForCourse(courseId));
  };

  const findAssignmentById = (req, res) => {
    const assignment = dao.findAssignmentById(req.params.assignmentId);
    if (!assignment) {
      res.sendStatus(404);
      return;
    }
    res.json(assignment);
  };

  const createAssignmentForCourse = (req, res) => {
    const { courseId } = req.params;
    const assignment = { ...req.body, course: courseId };
    const created = dao.createAssignment(assignment);
    res.json(created);
  };

  const updateAssignment = (req, res) => {
    const { assignmentId } = req.params;
    const existing = dao.findAssignmentById(assignmentId);
    if (!existing) {
      res.sendStatus(404);
      return;
    }
    const updated = dao.updateAssignment(assignmentId, req.body);
    res.json(updated);
  };

  const deleteAssignment = (req, res) => {
    const { assignmentId } = req.params;
    const existing = dao.findAssignmentById(assignmentId);
    if (!existing) {
      res.sendStatus(404);
      return;
    }
    dao.deleteAssignment(assignmentId);
    res.sendStatus(204);
  };

  app.get("/api/assignments", findAllAssignments);
  app.get("/api/assignments/:assignmentId", findAssignmentById);
  app.get("/api/courses/:courseId/assignments", findAssignmentsForCourse);
  app.post("/api/courses/:courseId/assignments", createAssignmentForCourse);
  app.put("/api/assignments/:assignmentId", updateAssignment);
  app.delete("/api/assignments/:assignmentId", deleteAssignment);
}
