import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import { hash, compare } from 'bcrypt';

const secret = 'secret'; // TODO: Replace with a path to a secret key
const saltRounds = 10;

/**
 * Generate a JWT for the given username
 * @param username: string
 * @returns JWT that encodes the username
 */
export function generateToken(username: string): string {
  const payload = {
    username: username
  };
  return jwt.sign(payload, secret, { expiresIn: '10h' });
}

/**
 * Verify the token and return the username
 * @param token: string
 * @returns username: string
 */
export async function verifyToken(token: string): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err: Error | null, decoded: string | JwtPayload | undefined) => {
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

/**
 * Hash password for storage in db
 * @param password: string
 * @returns the hashed password as a string
 */
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, saltRounds);
}

/**
 * Compares inputted plain text password with hashed password
 * @param password: string
 * @param hash: string
 * @returns true if the password matches the hash, false otherwise
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await compare(password, hash);
}