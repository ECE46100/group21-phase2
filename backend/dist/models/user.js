"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    ID: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: new sequelize_1.DataTypes.STRING(128),
        allowNull: false,
        unique: true
    },
    password: {
        type: new sequelize_1.DataTypes.STRING(128),
        allowNull: false
    },
    uploadPerm: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false
    },
    downloadPerm: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false
    },
    searchPerm: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false
    },
    adminPerm: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false
    },
    userGroup: {
        type: new sequelize_1.DataTypes.STRING(128),
        allowNull: false
    },
    tokenUses: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    }
}, {
    tableName: 'users',
    sequelize: db_1.default,
    timestamps: true
});
