import ModulesDao from "./dao.js";

export default function ModuleRoutes(app, db) {
  const dao = ModulesDao(db);

  const findModulesForCourse = async (req, res) => {
    const { courseId } = req.params;
    const modules = await dao.findModulesForCourse(courseId);
    res.json(modules);
  };

  const createModuleForCourse = async (req, res) => {
    const { courseId } = req.params;
    const module = { ...req.body };
    const newModule = await dao.createModule(courseId, module);
    res.json(newModule);
  };

  const updateModule = async (req, res) => {
    const { courseId, moduleId } = req.params;
    const updated = await dao.updateModule(courseId, moduleId, req.body);
    if (!updated) {
      res.sendStatus(404);
      return;
    }
    res.json(updated);
  };

  const deleteModule = async (req, res) => {
    const { courseId, moduleId } = req.params;
    const ok = await dao.deleteModule(courseId, moduleId);
    if (!ok) {
      res.sendStatus(404);
      return;
    }
    res.sendStatus(204);
  };

  app.get("/api/courses/:courseId/modules", findModulesForCourse);
  app.post("/api/courses/:courseId/modules", createModuleForCourse);
  app.put("/api/courses/:courseId/modules/:moduleId", updateModule);
  app.delete("/api/courses/:courseId/modules/:moduleId", deleteModule);
}
