import { v4 as uuidv4 } from "uuid";

export default function EnrollmentsDao(db) {
  const findEnrollmentsForUser = (userId) =>
    db.enrollments.filter((e) => e.user === userId);

  const enrollUserInCourse = (userId, courseId) => {
    const exists = db.enrollments.some(
      (e) => e.user === userId && e.course === courseId,
    );
    if (exists) {
      return null;
    }
    const enrollment = { _id: uuidv4(), user: userId, course: courseId };
    db.enrollments = [...db.enrollments, enrollment];
    return enrollment;
  };

  const unenrollUserFromCourse = (userId, courseId) => {
    const before = db.enrollments.length;
    db.enrollments = db.enrollments.filter(
      (e) => !(e.user === userId && e.course === courseId),
    );
    return db.enrollments.length < before;
  };

  return {
    findEnrollmentsForUser,
    enrollUserInCourse,
    unenrollUserFromCourse,
  };
}
