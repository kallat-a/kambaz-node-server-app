import { v4 as uuidv4 } from "uuid";
import model from "./model.js";

function sumQuestionPoints(questions) {
  return (questions || []).reduce((s, q) => s + (Number(q.points) || 0), 0);
}

function gradeAnswers(quiz, answers) {
  const questions = quiz.questions || [];
  const answerMap = new Map(
    (answers || []).map((a) => [a.questionId, a.value]),
  );
  let score = 0;
  const maxScore = sumQuestionPoints(questions);
  const results = [];
  for (const q of questions) {
    const val = answerMap.get(q._id);
    let correct = false;
    let earned = 0;
    const pts = Number(q.points) || 0;
    if (q.type === "MULTIPLE_CHOICE") {
      const want = new Set(
        (q.correctMcChoiceIds && q.correctMcChoiceIds.length
          ? q.correctMcChoiceIds
          : q.correctMcChoiceId
            ? [q.correctMcChoiceId]
            : []
        ).map((id) => String(id)),
      );
      let got = new Set();
      if (val != null && val !== "") {
        try {
          const parsed = JSON.parse(String(val));
          if (Array.isArray(parsed)) {
            got = new Set(parsed.map((id) => String(id)));
          } else {
            got.add(String(val));
          }
        } catch {
          got.add(String(val));
        }
      }
      correct =
        want.size > 0 &&
        want.size === got.size &&
        [...want].every((id) => got.has(id));
    } else if (q.type === "TRUE_FALSE") {
      const want = q.correctTrueFalse === true;
      const got = val === "true" || val === true;
      correct = got === want;
    } else if (q.type === "FILL_BLANK") {
      const norm = (s) => String(s || "").trim().toLowerCase();
      const blanks = q.fibBlanks && q.fibBlanks.length ? q.fibBlanks : null;
      if (!blanks) {
        const g = norm(val);
        correct = (q.fibCorrectAnswers || []).some((a) => norm(a) === g);
      } else {
        let responses = [];
        try {
          const parsed = JSON.parse(String(val ?? ""));
          if (Array.isArray(parsed)) {
            responses = parsed.map((x) => norm(x));
          } else {
            responses = [norm(val)];
          }
        } catch {
          responses = [norm(val)];
        }
        if (responses.length !== blanks.length) {
          correct = false;
        } else {
          correct = blanks.every((b, i) =>
            (b.correctAnswers || []).some((a) => norm(a) === responses[i]),
          );
        }
      }
    }
    if (correct) {
      earned = pts;
      score += pts;
    }
    results.push({ questionId: q._id, correct, earned });
  }
  return { score, maxScore, results };
}

export default function QuizzesDao() {
  const findQuizzesForCourse = (courseId) =>
    model.find({ course: courseId }).sort({ title: 1 }).lean();

  const findQuizById = (quizId) => model.findById(quizId).lean();

  const createQuiz = async (courseId, overrides = {}) => {
    const doc = {
      _id: uuidv4(),
      course: courseId,
      title: overrides.title || "Untitled Quiz",
      description: overrides.description || "",
      published: false,
      questions: [],
      ...overrides,
    };
    return model.create(doc);
  };

  const updateQuiz = async (quizId, updates) => {
    const { _id: _i, questions: _q, ...rest } = updates;
    const setDoc = { ...rest };
    if (updates.questions !== undefined) {
      setDoc.questions = updates.questions;
    }
    await model.updateOne({ _id: quizId }, { $set: setDoc });
    return model.findById(quizId).lean();
  };

  const deleteQuiz = async (quizId) => {
    const r = await model.deleteOne({ _id: quizId });
    return r.deletedCount > 0;
  };

  const deleteQuizzesForCourse = (courseId) =>
    model.deleteMany({ course: courseId });

  return {
    findQuizzesForCourse,
    findQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    deleteQuizzesForCourse,
    sumQuestionPoints,
    gradeAnswers,
  };
}
