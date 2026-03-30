import UsersDao from "./dao.js";

function sanitize(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

export default function UserRoutes(app, db) {
  const dao = UsersDao(db);

  const signin = (req, res) => {
    const { username, password } = req.body;
    const user = dao.findUserByUsername(username);
    if (!user || user.password !== password) {
      res.status(403).json({ message: "Invalid credentials" });
      return;
    }
    req.session.currentUser = sanitize(user);
    res.json(req.session.currentUser);
  };

  const signout = (req, res) => {
    if (!req.session) {
      res.sendStatus(200);
      return;
    }
    req.session.destroy((err) => {
      if (err) {
        res.sendStatus(500);
        return;
      }
      res.sendStatus(200);
    });
  };

  const profile = (req, res) => {
    res.json(req.session?.currentUser ?? null);
  };

  const signup = (req, res) => {
    const created = dao.createUser(req.body);
    if (!created) {
      res.status(400).json({ message: "Username already taken" });
      return;
    }
    req.session.currentUser = sanitize(created);
    res.json(req.session.currentUser);
  };

  const findAllUsers = (req, res) => {
    res.json(dao.findAllUsers().map(sanitize));
  };

  const findUserById = (req, res) => {
    const user = dao.findUserById(req.params.userId);
    if (!user) {
      res.sendStatus(404);
      return;
    }
    res.json(sanitize(user));
  };

  const updateUser = (req, res) => {
    const { userId } = req.params;
    const existing = dao.findUserById(userId);
    if (!existing) {
      res.sendStatus(404);
      return;
    }
    const updated = dao.updateUser(userId, req.body);
    const clean = sanitize(updated);
    if (req.session.currentUser && req.session.currentUser._id === userId) {
      req.session.currentUser = clean;
    }
    res.json(clean);
  };

  const deleteUser = (req, res) => {
    const ok = dao.deleteUser(req.params.userId);
    if (!ok) {
      res.sendStatus(404);
      return;
    }
    res.sendStatus(204);
  };

  app.post("/api/users/signin", signin);
  app.post("/api/users/signout", signout);
  app.get("/api/users/profile", profile);
  app.post("/api/users", signup);
  app.get("/api/users", findAllUsers);
  app.get("/api/users/:userId", findUserById);
  app.put("/api/users/:userId", updateUser);
  app.delete("/api/users/:userId", deleteUser);
}
