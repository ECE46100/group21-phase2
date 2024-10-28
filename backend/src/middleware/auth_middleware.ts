import userService from "../services/userService";

async function authMiddleware(req: any, res: any, next: any) {
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
  req.middleWareData = {
    username: username,
  };
  next();
}

async function permMiddleware(req: any, res: any, next: any) {
  const userPerms = await userService.getUserPerms(req.middleWareData.username);
  req.middleWareData.permissions = userPerms;
  next();
}

export { authMiddleware, permMiddleware };