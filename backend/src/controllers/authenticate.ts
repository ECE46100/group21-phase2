import { Request, Response } from 'express';
import UserService from '../services/userService';
import { z } from 'zod';

const UserSchema = z.object({
  name:    z.string(),
  isAdmin: z.boolean(),
});

const SecretSchema = z.object({
  password: z.string(),
});

const AuthSchema = z.object({
  User:   UserSchema,
  Secret: SecretSchema,
});

type AuthSchema = z.infer<typeof AuthSchema>;

function isAuthSchema(authRequest: unknown): authRequest is AuthSchema {
  return AuthSchema.safeParse(authRequest).success;
}

export default async function authenticate(req: Request, res: Response) {
  const authRequest: unknown = req.body;
  if (!isAuthSchema(authRequest)) {
    res.status(400).send('Invalid request');
    return;
  }
  const user = authRequest.User;
  const secret = authRequest.Secret;
  try {
    const isValidUser = await UserService.verifyUser(user.name, secret.password);
    if (isValidUser) {
      const token = await UserService.generateToken(user.name);
      res.status(200).send(`bearer ${token}`);
    } else {
      res.status(401).send('Unauthorized');
    }
  } catch {
    res.status(401).send('Unauthorized');
  }
}
