import { Request, Response } from 'express';
import UserService from '../services/userService';

interface UserSchema {
  name: string;
  isAdmin: boolean;
}

interface UserAuthenticationSchema {
  password: string;
}

function isUserSchema(user: any): user is UserSchema {
  return typeof user.name === 'string' && typeof user.isAdmin === 'boolean';
}

function isUserAuthenticationSchema(user: any): user is UserAuthenticationSchema {
  return typeof user.password === 'string';
}

export default async function authenticate(req: Request, res: Response) {
  const { User: user, Secret: secret } = req.body;
  if (!isUserSchema(user) || !isUserAuthenticationSchema(secret)) {
    res.status(400).send('Invalid request');
    return;
  }
  try {
    const isValidUser = await UserService.verifyUser(user.name, secret.password);
    if (isValidUser) {
      const token = await UserService.generateToken(user.name);
      res.status(200).send(token);
    } else {
      res.status(401).send('Unauthorized');
    }
  } catch {
    res.status(401).send('Unauthorized');
  }
}
