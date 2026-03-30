import { v4 as uuidv4 } from "uuid";

export default function CoursesDao(db) {
  const findAllCourses = () => db.courses;

  const findCourseById = (courseId) =>
    db.courses.find((c) => c._id === courseId);

  const findCoursesForUser = (userId) => {
    const enrolledIds = db.enrollments
      .filter((e) => e.user === userId)
      .map((e) => e.course);
    return db.courses.filter((c) => enrolledIds.includes(c._id));
  };

  const createCourse = (course) => {
    const newCourse = { ...course, _id: course._id || uuidv4() };
    db.courses = [...db.courses, newCourse];
    return newCourse;
  };

  const updateCourse = (courseId, updates) => {
    db.courses = db.courses.map((c) =>
      c._id === courseId ? { ...c, ...updates, _id: courseId } : c,
    );
    return findCourseById(courseId);
  };

  const deleteCourse = (courseId) => {
    const before = db.courses.length;
    db.courses = db.courses.filter((c) => c._id !== courseId);
    db.modules = db.modules.filter((m) => m.course !== courseId);
    db.assignments = db.assignments.filter((a) => a.course !== courseId);
    db.enrollments = db.enrollments.filter((e) => e.course !== courseId);
    return db.courses.length < before;
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
