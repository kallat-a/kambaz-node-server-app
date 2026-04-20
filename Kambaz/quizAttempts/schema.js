import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    _id: String,
    user: { type: String, ref: "UserModel" },
    quiz: { type: String, ref: "QuizModel" },
    course: String,
    attemptNumber: Number,
    answers: [{ questionId: String, value: String }],
    score: Number,
    maxScore: Number,
    results: [
      {
        questionId: String,
        correct: Boolean,
        earned: Number,
      },
    ],
  },
  { collection: "quizAttempts" },
);

export default quizAttemptSchema;
