import model from "./model.js";

export default function EnrollmentsDao(_db) {
  async function findCoursesForUser(userId) {
    const enrollments = await model.find({ user: userId }).populate("course");
    return enrollments
      .map((e) => e.course)
      .filter((c) => c != null);
  }

  async function findUsersForCourse(courseId) {
    const enrollments = await model.find({ course: courseId }).populate("user");
    return enrollments
      .map((e) => e.user)
      .filter((u) => u != null);
  }

  async function findEnrollmentsForUser(userId) {
    return model.find({ user: userId }).lean();
  }

  async function enrollUserInCourse(userId, courseId) {
    const exists = await model.findOne({ user: userId, course: courseId });
    if (exists) {
      return null;
    }
    return model.create({
      _id: `${userId}-${courseId}`,
      user: userId,
      course: courseId,
      enrollmentDate: new Date(),
    });
  }

  async function unenrollUserFromCourse(userId, courseId) {
    const result = await model.deleteOne({ user: userId, course: courseId });
    return result.deletedCount > 0;
  }

  function unenrollAllUsersFromCourse(courseId) {
    return model.deleteMany({ course: courseId });
  }

  async function isUserEnrolledInCourse(userId, courseId) {
    const row = await model.findOne({ user: userId, course: courseId }).lean();
    return Boolean(row);
  }

  return {
    findCoursesForUser,
    findUsersForCourse,
    findEnrollmentsForUser,
    enrollUserInCourse,
    unenrollUserFromCourse,
    unenrollAllUsersFromCourse,
    isUserEnrolledInCourse,
  };
}
