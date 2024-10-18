import { Sequelize } from "sequelize";

export const sequelize = new Sequelize( 'phase2_db', 'georgenolan', 'Maddie23!!', {
  host: 'localhost',
  dialect: 'postgres'
});

export default sequelize;