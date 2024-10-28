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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = __importDefault(require("./controllers/authenticate"));
const router = (0, express_1.Router)();
router.post('/packages', (req, res) => {
    const page = req.query.page || 1;
    // TODO: Implement the logic to fetch the packages from the database
});
router.delete('/reset', (req, res) => {
    // TODO: Implement the logic to reset the database
});
router.get('/package/:id', (req, res) => {
    const id = req.params.id;
    // TODO: Implement the logic to fetch the package by id from the database
});
router.put('/package/:id', (req, res) => {
    const id = req.params.id;
    // TODO: Implement the logic to update the package by id in the database
});
router.post('/package', (req, res) => {
    // TODO: Implement the logic to create a new package in the database
});
router.get('/pakcage/:id/rate', (req, res) => {
    const id = req.params.id;
    // TODO: Implement the logic to fetch the rating of the package by id from the database
});
router.post('/package/:id/cost', (req, res) => {
    const id = req.params.id;
    // TODO: Implement the logic to calculate the cost of the package by id
});
router.put('/authenticate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, authenticate_1.default)(req, res);
}));
router.get('/package/byName/:name', (req, res) => {
    const name = req.params.name;
    // TODO: Implement the logic to fetch the package by name from the database
});
router.post('/package/byRegEx', (req, res) => {
    // TODO: Implement the logic to fetch the packages by regular expression from the database
});
router.get('/track', (req, res) => {
    // TODO: Implement the logic to return the track
});
