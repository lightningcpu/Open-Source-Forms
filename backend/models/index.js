import { readdirSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import sequelize from "../config/db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = {};

const modelFiles = readdirSync(__dirname).filter(
  (file) =>
    file !== "index.js" && file.endsWith(".js") && !file.includes(".test.js")
);

await Promise.all(
  modelFiles.map(async (file) => {
    const modelModule = await import(`./${file}`);
    const model = modelModule.default;
    db[model.name] = model;
  })
);

Object.keys(db).forEach((modelName) => {
  if (typeof db[modelName].associate === "function") {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
try {
  await sequelize.authenticate();
  console.log("Database connection established");
} catch (err) {
  console.error("Unable to connect to database:", err);
}

export default db;
