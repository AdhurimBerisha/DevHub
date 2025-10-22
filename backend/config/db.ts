import "dotenv/config";
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME || "your_database_name",
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD || "your_password",
  {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    dialect: "postgres",
    logging: false, // Hide internal health check queries
  }
);

export default sequelize;
