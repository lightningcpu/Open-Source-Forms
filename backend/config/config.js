import dotenv from "dotenv";
import path from "path";

const __dirname = path.resolve();

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const config = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "postgres",
  logging: false,
};

export default config;
