import { v4 as uuidv4 } from "uuid";
import model from "./model.js";

export default function QuizAttemptsDao() {
  const countAttempts = async (userId, quizId) =>
    model.countDocuments({ user: userId, quiz: quizId });

  const findLastAttempt = async (userId, quizId) =>
    model
      .findOne({ user: userId, quiz: quizId })
      .sort({ attemptNumber: -1 })
      .lean();

  const createAttempt = async (doc) => {
    const row = {
      ...doc,
      _id: doc._id || uuidv4(),
    };
    return model.create(row);
  };

  const deleteAttemptsForQuiz = (quizId) =>
    model.deleteMany({ quiz: quizId });

  const deleteAttemptsForCourse = (courseId) =>
    model.deleteMany({ course: courseId });

  return {
    countAttempts,
    findLastAttempt,
    createAttempt,
    deleteAttemptsForQuiz,
    deleteAttemptsForCourse,
  };
}
