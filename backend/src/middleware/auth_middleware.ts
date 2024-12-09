import userService from "../services/userService";
import { Response, NextFunction } from "express";
import { Request } from "express-serve-static-core";

/**
 * Middleware to authenticate the user
 * @param req : Request
 * @param res : Response
 * @param next : NextFunction
 * @returns goes to next if token is valid
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.header("X-Authorization")?.split(" ")[1];
  if (!token) {
    res.status(403).send("Unauthorized - no token provided");
    return;
  }
  try {
    const username = await userService.verifyToken(token);
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
  } catch {
    res.status(403).send("Unauthorized - invalid token");
    return;
  }
}

/**
 * Middleware to check the permissions of the user
 * @param req : Request
 * @param res : Response
 * @param next : NextFunction
 * @returns next if user has permissions
 */
export async function permMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const userPerms = await userService.getUserPerms(req.middleware.username);
    req.middleware.permissions = userPerms;
    next();
  } catch {
    res.status(403).send("Unauthorized - invalid user");
    return;
  }
}
