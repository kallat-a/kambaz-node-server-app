import { v4 as uuidv4 } from "uuid";
import model from "../courses/model.js";

export default function ModulesDao(_db) {
  async function findModulesForCourse(courseId) {
    const course = await model.findById(courseId);
    if (!course) {
      return [];
    }
    return course.modules ?? [];
  }

  async function createModule(courseId, module) {
    const newModule = {
      ...module,
      _id: module._id || uuidv4(),
      lessons: module.lessons ?? [],
    };
    delete newModule.course;
    await model.updateOne({ _id: courseId }, { $push: { modules: newModule } });
    return newModule;
  }

  async function deleteModule(courseId, moduleId) {
    const result = await model.updateOne(
      { _id: courseId },
      { $pull: { modules: { _id: moduleId } } },
    );
    return result.modifiedCount > 0;
  }

  async function updateModule(courseId, moduleId, moduleUpdates) {
    const course = await model.findById(courseId);
    if (!course || !course.modules) {
      return null;
    }
    const sub = course.modules.find((m) => m._id === moduleId);
    if (!sub) {
      return null;
    }
    const { _id: _ignored, ...rest } = moduleUpdates;
    Object.assign(sub, rest);
    await course.save();
    return sub;
  }

  return {
    findModulesForCourse,
    createModule,
    deleteModule,
    updateModule,
  };
}
