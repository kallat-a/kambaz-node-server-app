import AssignmentsDao from "./dao.js";

export default function AssignmentRoutes(app, db) {
  const dao = AssignmentsDao(db);

  const findAllAssignments = async (req, res) => {
    const list = await dao.findAllAssignments();
    res.json(list);
  };

  const findAssignmentsForCourse = async (req, res) => {
    const { courseId } = req.params;
    const list = await dao.findAssignmentsForCourse(courseId);
    res.json(list);
  };

  const findAssignmentById = async (req, res) => {
    const assignment = await dao.findAssignmentById(req.params.assignmentId);
    if (!assignment) {
      res.sendStatus(404);
      return;
    }
    res.json(assignment);
  };

  const createAssignmentForCourse = async (req, res) => {
    const { courseId } = req.params;
    const assignment = { ...req.body, course: courseId };
    const created = await dao.createAssignment(assignment);
    res.json(created);
  };

  const updateAssignment = async (req, res) => {
    const { assignmentId } = req.params;
    const existing = await dao.findAssignmentById(assignmentId);
    if (!existing) {
      res.sendStatus(404);
      return;
    }
    const updated = await dao.updateAssignment(assignmentId, req.body);
    res.json(updated);
  };

  const deleteAssignment = async (req, res) => {
    const { assignmentId } = req.params;
    const ok = await dao.deleteAssignment(assignmentId);
    if (!ok) {
      res.sendStatus(404);
      return;
    }
    res.sendStatus(204);
  };

  app.get("/api/assignments", findAllAssignments);
  app.get("/api/assignments/:assignmentId", findAssignmentById);
  app.get("/api/courses/:courseId/assignments", findAssignmentsForCourse);
  app.post("/api/courses/:courseId/assignments", createAssignmentForCourse);
  app.put("/api/assignments/:assignmentId", updateAssignment);
  app.delete("/api/assignments/:assignmentId", deleteAssignment);
}
