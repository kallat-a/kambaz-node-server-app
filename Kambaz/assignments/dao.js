import { v4 as uuidv4 } from "uuid";
import model from "./model.js";

export default function AssignmentsDao(_db) {
  const findAllAssignments = () => model.find();

  const findAssignmentsForCourse = (courseId) =>
    model.find({ course: courseId });

  const findAssignmentById = (assignmentId) => model.findById(assignmentId);

  const createAssignment = (assignment) => {
    const newAssignment = { ...assignment, _id: assignment._id || uuidv4() };
    return model.create(newAssignment);
  };

  const updateAssignment = async (assignmentId, updates) => {
    const { _id: _ignored, ...rest } = updates;
    await model.updateOne({ _id: assignmentId }, { $set: rest });
    return model.findById(assignmentId);
  };

  const deleteAssignment = async (assignmentId) => {
    const result = await model.deleteOne({ _id: assignmentId });
    return result.deletedCount > 0;
  };

  const deleteAssignmentsForCourse = (courseId) =>
    model.deleteMany({ course: courseId });

  return {
    findAllAssignments,
    findAssignmentsForCourse,
    findAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    deleteAssignmentsForCourse,
  };
}
