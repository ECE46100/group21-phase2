import { UserPerms } from 'user-types';

declare module 'express-serve-static-core' {
  interface Request {
    middleware: {
      username: string;
      permissions: UserPerms;
    };
  }
}