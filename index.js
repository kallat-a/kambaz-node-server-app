import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import Hello from "./Hello.js";
import Lab5 from "./Lab5/index.js";
import db from "./Kambaz/database/index.js";
import UserRoutes from "./Kambaz/users/routes.js";
import CourseRoutes from "./Kambaz/courses/routes.js";
import ModuleRoutes from "./Kambaz/modules/routes.js";
import AssignmentRoutes from "./Kambaz/assignments/routes.js";
import EnrollmentRoutes from "./Kambaz/enrollments/routes.js";

const CONNECTION_STRING =
  process.env.DATABASE_CONNECTION_STRING ||
  "mongodb://127.0.0.1:27017/kambaz";

if (process.env.RENDER === "true" && !process.env.DATABASE_CONNECTION_STRING) {
  console.error(
    "DATABASE_CONNECTION_STRING is not set. Add your Atlas URI in Render → Environment.",
  );
  process.exit(1);
}

const app = express();

const normalizeOrigin = (url) =>
  (url || "").trim().replace(/\/$/, "");

const allowedClientOrigin = normalizeOrigin(
  process.env.CLIENT_URL || "http://localhost:3000",
);

app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (normalizeOrigin(origin) === allowedClientOrigin) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);

const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz-session-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOptions));
app.use(express.json());

UserRoutes(app, db);
CourseRoutes(app, db);
ModuleRoutes(app, db);
AssignmentRoutes(app, db);
EnrollmentRoutes(app, db);
Lab5(app);
Hello(app);

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

async function start() {
  try {
    await mongoose.connect(CONNECTION_STRING, {
      serverSelectionTimeoutMS: 15_000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

start();
