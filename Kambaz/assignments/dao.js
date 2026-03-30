import { v4 as uuidv4 } from "uuid";

export default function AssignmentsDao(db) {
  const findAllAssignments = () => db.assignments;

  const findAssignmentsForCourse = (courseId) =>
    db.assignments.filter((a) => a.course === courseId);

  const findAssignmentById = (assignmentId) =>
    db.assignments.find((a) => a._id === assignmentId);

  const createAssignment = (assignment) => {
    const newAssignment = { ...assignment, _id: uuidv4() };
    db.assignments = [...db.assignments, newAssignment];
    return newAssignment;
  };

  const updateAssignment = (assignmentId, updates) => {
    db.assignments = db.assignments.map((a) =>
      a._id === assignmentId ? { ...a, ...updates, _id: assignmentId } : a,
    );
    return findAssignmentById(assignmentId);
  };

  const deleteAssignment = (assignmentId) => {
    db.assignments = db.assignments.filter((a) => a._id !== assignmentId);
  };

  return {
    findAllAssignments,
    findAssignmentsForCourse,
    findAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  };
}
