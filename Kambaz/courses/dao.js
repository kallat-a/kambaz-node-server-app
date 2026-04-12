import { v4 as uuidv4 } from "uuid";
import model from "./model.js";

export default function CoursesDao(db) {
  const findAllCourses = () => model.find();

  const findCourseById = (courseId) => model.findById(courseId);

  const findCoursesForUser = async (userId) => {
    const courses = await model.find();
    const enrolledCourses = courses.filter((course) =>
      db.enrollments.some(
        (enrollment) =>
          enrollment.user === userId && enrollment.course === course._id,
      ),
    );
    return enrolledCourses;
  };

  const createCourse = (course) => {
    const newCourse = { ...course, _id: course._id || uuidv4() };
    return model.create(newCourse);
  };

  const updateCourse = async (courseId, updates) => {
    const { _id: _ignored, ...rest } = updates;
    await model.updateOne({ _id: courseId }, { $set: rest });
    return model.findById(courseId);
  };

  const deleteCourse = async (courseId) => {
    db.modules = db.modules.filter((m) => m.course !== courseId);
    db.assignments = db.assignments.filter((a) => a.course !== courseId);
    db.enrollments = db.enrollments.filter((e) => e.course !== courseId);
    const result = await model.deleteOne({ _id: courseId });
    return result.deletedCount > 0;
  };

  return {
    findAllCourses,
    findCourseById,
    findCoursesForUser,
    createCourse,
    updateCourse,
    deleteCourse,
  };
}
