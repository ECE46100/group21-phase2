import userService from "../services/userService";
import { Response, NextFunction } from "express";
import { Request } from "express-serve-static-core";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.header("X-Authorization");
  if (!token) {
    res.status(403).send("Unauthorized - no token provided");
    return;
  }
  const username = await userService.verifyToken(token);
  if (!username) {
    res.status(403).send("Unauthorized - invalid token");
    return;
  }
  req.middleware = {
    username: username,
    permissions: {
      uploadPerm: false,
      downloadPerm: false,
      searchPerm: false,
      adminPerm: false,
    },
  };
  next();
}

export async function permMiddleware(req: Request, res: Response, next: NextFunction) {
  const userPerms = await userService.getUserPerms(req.middleware.username);
  if (!userPerms) {
    res.status(403).send("Unauthorized - invalid user");
    return;
  }
  req.middleware.permissions = userPerms;
  next();
}
