import { v4 as uuidv4 } from "uuid";

export default function ModulesDao(db) {
  const findModulesForCourse = (courseId) =>
    db.modules.filter((m) => m.course === courseId);

  const findModuleById = (moduleId) =>
    db.modules.find((m) => m._id === moduleId);

  const createModule = (module) => {
    const newModule = {
      ...module,
      _id: module._id || uuidv4(),
      lessons: module.lessons ?? [],
    };
    db.modules = [...db.modules, newModule];
    return newModule;
  };

  const updateModule = (moduleId, updates) => {
    db.modules = db.modules.map((m) =>
      m._id === moduleId ? { ...m, ...updates, _id: moduleId } : m,
    );
    return findModuleById(moduleId);
  };

  const deleteModule = (moduleId) => {
    const before = db.modules.length;
    db.modules = db.modules.filter((m) => m._id !== moduleId);
    return db.modules.length < before;
  };

  return {
    findModulesForCourse,
    findModuleById,
    createModule,
    updateModule,
    deleteModule,
  };
}
