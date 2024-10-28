"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
class Version extends sequelize_1.Model {
}
Version.init({
    ID: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    version: {
        type: new sequelize_1.DataTypes.STRING(128),
        allowNull: false
    },
    packageID: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    packagePath: {
        type: new sequelize_1.DataTypes.STRING(128),
        allowNull: false
    },
    author: {
        type: new sequelize_1.DataTypes.STRING(128),
        allowNull: false
    },
    accessLevel: {
        type: new sequelize_1.DataTypes.STRING(128),
        allowNull: true
    },
    programPath: {
        type: new sequelize_1.DataTypes.STRING(128),
        allowNull: true
    }
}, {
    sequelize: db_1.default,
    tableName: 'versions',
    timestamps: true
});
exports.default = Version;
