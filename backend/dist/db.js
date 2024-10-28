"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
exports.sequelize = new sequelize_1.Sequelize('phase2_db', 'georgenolan', 'Maddie23!!', {
    host: 'localhost',
    dialect: 'postgres'
});
exports.default = exports.sequelize;
