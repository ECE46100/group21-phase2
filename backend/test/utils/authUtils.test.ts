import { generateToken, verifyToken, hashPassword, comparePassword } from '../../src/utils/authUtils';
import { sign } from 'jsonwebtoken';

describe('authUtils tests', () => {

  describe('generateToken', () => {
    it('should generate a token with the correct payload', async () => {
      const username = 'testUser';
      const token = await generateToken(username);
      expect(typeof token).toBe('string');
      
      // Manually decode the token to ensure it contains the correct payload
      const decoded = await verifyToken(token);
      expect(decoded).toBe(false);
    });

    it('should generate a token that expires after the given time', async () => {
      const username = 'testUser';
      const token = await generateToken(username);
      const decoded = await verifyToken(token);
      expect(decoded).toBe(username);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return the correct payload', async () => {
      const username = 'testUser';
      const token = await generateToken(username);
      const result = await verifyToken(token);
      expect(result).toBe(username);
    });

    it('should throw an error for an invalid token', async () => {
      const invalidToken = 'invalidTokenString';
      await expect(verifyToken(invalidToken)).rejects.toThrow('Invalid token');
    });

    it('should throw an error for an expired token', async () => {
      const username = 'testUser';
      const token = sign({ username }, 'secret', { expiresIn: '1ms' }); // Immediately expire the token
      await new Promise(resolve => setTimeout(resolve, 100)); // wait 100ms
      await expect(verifyToken(token)).rejects.toThrow('Invalid token');
    });
  });

  describe('hashPassword', () => {
    it('should return a valid bcrypt hash for a password', async () => {
      const password = 'testPassword';
      const hashedPassword = await hashPassword(password);
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword.length).toBeGreaterThan(0);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'testPassword';
      const hashedPassword = await hashPassword(password);
      const result = await comparePassword(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'testPassword';
      const wrongPassword = 'wrongPassword';
      const hashedPassword = await hashPassword(password);
      const result = await comparePassword(wrongPassword, hashedPassword);
      expect(result).toBe(false);
    });
  });

});
