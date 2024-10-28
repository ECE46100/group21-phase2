"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../models/user");
const auth = __importStar(require("../utils/authUtils"));
class UserService {
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield auth.hashPassword(user.password);
            user.password = hashedPassword;
            try {
                yield user_1.User.create(user);
                return true;
            }
            catch (err) {
                return false;
            }
        });
    }
    deleteUser(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.getUser(username);
            if (user) {
                yield user_1.User.destroy({ where: { ID: user.ID } });
                return true;
            }
            return false;
        });
    }
    getUser(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield user_1.User.findOne({ where: { username: username } });
        });
    }
    verifyUser(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.getUser(username);
            if (user) {
                return yield auth.comparePassword(password, user.password);
            }
            return false;
        });
    }
    generateToken(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.getUser(username);
            if (!user) {
                return new Error("User not found");
            }
            yield user_1.User.update({ tokenUses: 1000 }, { where: { ID: user.ID } });
            return yield auth.generateToken(username);
        });
    }
    verifyToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const username = yield auth.verifyToken(token);
                const user = yield this.getUser(username);
                if (user) {
                    if (user.tokenUses > 0) {
                        yield user_1.User.update({ tokenUses: user.tokenUses - 1 }, { where: { ID: user.ID } }); // TODO: Potential Race Condition
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            }
            catch (err) {
                return false;
            }
            return false;
        });
    }
    getUserGroup(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.getUser(username);
            if (user) {
                return user.userGroup;
            }
            return null;
        });
    }
    getUserPerms(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.getUser(username);
            if (user) {
                return {
                    uploadPerm: user.uploadPerm,
                    downloadPerm: user.downloadPerm,
                    searchPerm: user.searchPerm,
                    adminPerm: user.adminPerm
                };
            }
            return null;
        });
    }
}
exports.default = new UserService();
