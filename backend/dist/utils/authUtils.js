"use strict";
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
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
const jsonwebtoken_1 = require("jsonwebtoken");
const bcrypt_1 = require("bcrypt");
const secret = 'secret'; // TODO: Replace with a path to a secret key
const saltRounds = 10;
function generateToken(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const payload = {
            username: username
        };
        return (0, jsonwebtoken_1.sign)(payload, secret, { expiresIn: '1h' });
    });
}
function verifyToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            (0, jsonwebtoken_1.verify)(token, secret, (err, decoded) => {
                if (err) {
                    reject(new Error('Invalid token'));
                }
                else {
                    if (typeof decoded === 'string') {
                        resolve(decoded);
                    }
                    else if (typeof decoded !== 'undefined') {
                        resolve(decoded.username);
                    }
                    else {
                        reject(new Error('Invalid token'));
                    }
                }
            });
        });
    });
}
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, bcrypt_1.hash)(password, saltRounds);
    });
}
function comparePassword(password, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, bcrypt_1.compare)(password, hash);
    });
}
