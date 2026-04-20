import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    _id: String,
    type: {
      type: String,
      enum: ["MULTIPLE_CHOICE", "TRUE_FALSE", "FILL_BLANK"],
      required: true,
    },
    title: String,
    points: { type: Number, default: 1 },
    question: { type: String, default: "" },
    mcChoices: [{ _id: String, text: String }],
    correctMcChoiceId: String,
    correctMcChoiceIds: [String],
    correctTrueFalse: Boolean,
    fibCorrectAnswers: [String],
    fibBlanks: [
      {
        _id: String,
        correctAnswers: [String],
      },
    ],
  },
  { _id: false },
);

const quizSchema = new mongoose.Schema(
  {
    _id: String,
    course: { type: String, ref: "CourseModel" },
    title: { type: String, default: "Untitled Quiz" },
    description: { type: String, default: "" },
    published: { type: Boolean, default: false },
    quizType: {
      type: String,
      enum: [
        "GRADED_QUIZ",
        "PRACTICE_QUIZ",
        "GRADED_SURVEY",
        "UNGRADED_SURVEY",
      ],
      default: "GRADED_QUIZ",
    },
    assignmentGroup: {
      type: String,
      enum: ["Quizzes", "Exams", "Assignments", "Project"],
      default: "Quizzes",
    },
    shuffleAnswers: { type: Boolean, default: true },
    timeLimitMinutes: { type: Number, default: 20 },
    multipleAttempts: { type: Boolean, default: false },
    howManyAttempts: { type: Number, default: 1 },
    showCorrectAnswers: { type: String, default: "AFTER_LAST_ATTEMPT" },
    accessCode: { type: String, default: "" },
    oneQuestionAtATime: { type: Boolean, default: true },
    webcamRequired: { type: Boolean, default: false },
    lockQuestionsAfterAnswering: { type: Boolean, default: false },
    dueDate: String,
    availableDate: String,
    untilDate: String,
    questions: { type: [questionSchema], default: [] },
  },
  { collection: "quizzes" },
);

export default quizSchema;
