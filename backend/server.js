import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import formRoutes from "./routes/formRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";
import path from "path";
import db from "./models/index.js";

db.sequelize
  .sync()
  .then(() => console.log("Database synchronized safely"))
  .catch((err) => console.error("Database sync failed:", err));

const port = process.env.PORT || 5000;

dotenv.config();

const __dirname = path.resolve();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/tags", tagRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API running...");
  });
}

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`Server running, port ${port}`));
