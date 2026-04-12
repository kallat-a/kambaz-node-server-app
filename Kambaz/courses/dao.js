import { v4 as uuidv4 } from "uuid";
import model from "./model.js";

const dashboardCourseProjection = { name: 1, description: 1 };

export default function CoursesDao() {
  const findAllCourses = () =>
    model.find({}, dashboardCourseProjection);

  const findCourseById = (courseId) => model.findById(courseId);

  const createCourse = (course) => {
    const { modules: _m, ...rest } = course;
    const newCourse = { ...rest, _id: course._id || uuidv4(), modules: [] };
    return model.create(newCourse);
  };

  const updateCourse = async (courseId, updates) => {
    const { _id: _ignored, modules: _mod, ...rest } = updates;
    await model.updateOne({ _id: courseId }, { $set: rest });
    return model.findById(courseId);
  };

  const deleteCourse = async (courseId) => {
    const result = await model.deleteOne({ _id: courseId });
    return result;
  };

  return {
    findAllCourses,
    findCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
  };
}
