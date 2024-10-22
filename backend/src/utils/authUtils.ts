import { sign, verify } from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import { hash, compare } from 'bcrypt';

const secret = 'secret'; // TODO: Replace with a path to a secret key
const saltRounds = 10;

async function generateToken(username: string): Promise<string> {
  const payload = {
    username: username
  };
  return sign(payload, secret, { expiresIn: '1h' });
}

async function verifyToken(token: string): Promise<string> {
  return new Promise((resolve, reject) => {
    verify(token, secret, (err: Error | null, decoded: string | JwtPayload | undefined) => {
      if (err) {
        reject(new Error('Invalid token'));
      } else {
        if (typeof decoded === 'string') {
          resolve(decoded);
        } else if (typeof decoded !== 'undefined') {
          resolve(decoded.username);
        } else {
          reject(new Error('Invalid token'));
        }
      }
    });
  });
}

async function hashPassword(password: string): Promise<string> {
  return await hash(password, saltRounds);
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await compare(password, hash);
}

export { generateToken, verifyToken, hashPassword, comparePassword };