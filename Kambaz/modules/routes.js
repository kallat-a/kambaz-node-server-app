import ModulesDao from "./dao.js";

export default function ModuleRoutes(app, db) {
  const dao = ModulesDao(db);

  const findModulesForCourse = (req, res) => {
    res.json(dao.findModulesForCourse(req.params.courseId));
  };

  const createModuleForCourse = (req, res) => {
    const module = { ...req.body, course: req.params.courseId };
    res.json(dao.createModule(module));
  };

  const updateModule = (req, res) => {
    const { moduleId } = req.params;
    if (!dao.findModuleById(moduleId)) {
      res.sendStatus(404);
      return;
    }
    res.json(dao.updateModule(moduleId, req.body));
  };

  const deleteModule = (req, res) => {
    const ok = dao.deleteModule(req.params.moduleId);
    if (!ok) {
      res.sendStatus(404);
      return;
    }
    res.sendStatus(204);
  };

  app.get("/api/courses/:courseId/modules", findModulesForCourse);
  app.post("/api/courses/:courseId/modules", createModuleForCourse);
  app.put("/api/modules/:moduleId", updateModule);
  app.delete("/api/modules/:moduleId", deleteModule);
}
