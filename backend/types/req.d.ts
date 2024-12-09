/**
 * @fileoverview This file is used to extend the Request interface from Express.js
 */

import { UserPerms } from 'user-types';

declare module 'express-serve-static-core' {
  interface Request {
    middleware: {
      username: string;
      permissions: UserPerms;
    };
  }
}