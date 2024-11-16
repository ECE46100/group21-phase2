import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
dotenv.config();

let { DB_USER, DB_PASS, DB_HOST, DB_NAME, CI_ON } = process.env;

if (CI_ON) {
  DB_NAME = '';
  DB_USER = '';
  DB_PASS = '';
  DB_HOST = '';
}

if ((!DB_NAME || !DB_USER || !DB_PASS || !DB_HOST)) {
  throw new Error("Missing database configuration");
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: 'postgres'
});

export default sequelize;