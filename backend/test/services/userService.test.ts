import UserService from '../../src/services/userService';
import { User } from '../../src/models/user';
import * as auth from '../../src/utils/authUtils';

jest.mock('../../src/models/user');
jest.mock('../../src/utils/authUtils');

const mockUser = { 
  username: 'testuser',
  password: 'plaintextpassword',
  uploadPerm: true,
  downloadPerm: true,
  searchPerm: true,
  adminPerm: false,
  userGroup: 'testgroup',
};

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should hash the password and create a new user', async () => {
      const mockHashedPassword = 'hashedpassword';

      jest.spyOn(auth, 'hashPassword').mockResolvedValue(mockHashedPassword);
      jest.spyOn(User, 'create').mockResolvedValue(true);

      const result = await UserService.createUser(mockUser);
      const expectedUser = { ...mockUser, password: mockHashedPassword };

      expect(auth.hashPassword).toHaveBeenCalledWith('plaintextpassword');
      expect(User.create).toHaveBeenCalledWith(expectedUser);
      expect(result).toBe(undefined);
    });

    it('should throw an error if user does not exist', async () => {
      jest.spyOn(auth, 'hashPassword').mockResolvedValue('hashedpassword');
      jest.spyOn(User, 'create').mockRejectedValue(new Error('DB Error'));

      await expect(UserService.createUser(mockUser)).rejects.toThrow(new Error('Error: DB Error'));
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by username', async () => {
      const mockUserDelete = { ...mockUser, ID: 1, tokenUses: 1000 };

      jest.spyOn(UserService, 'getUser').mockResolvedValue(mockUserDelete);
      jest.spyOn(User, 'destroy').mockResolvedValue(1);

      const result = await UserService.deleteUser('testUser');
      expect(UserService.getUser).toHaveBeenCalledWith('testUser');
      expect(User.destroy).toHaveBeenCalledWith({ where: { ID: 1 } });
      expect(result).toBe(undefined);
    });

    it('should throw an error if the user does not exist', async () => {
      jest.spyOn(UserService, 'getUser').mockResolvedValue(null);

      await expect(UserService.deleteUser('testUser')).rejects.toThrow(new Error('User not found'));
    });
  });

  describe('verifyUser', () => {
    it('should return true if the username and password are correct', async () => {
      const mockUserVerify = { ...mockUser, password: 'hashedpassword', ID: 1, tokenUses: 1000 };

      jest.spyOn(UserService, 'getUser').mockResolvedValue(mockUserVerify);
      jest.spyOn(auth, 'comparePassword').mockResolvedValue(true);

      const result = await UserService.verifyUser('testUser', 'plaintextpassword');
      expect(UserService.getUser).toHaveBeenCalledWith('testUser');
      expect(auth.comparePassword).toHaveBeenCalledWith('plaintextpassword', 'hashedpassword');
      expect(result).toBe(true);
    });

    it('should return false if the username does not exist', async () => {
      jest.spyOn(UserService, 'getUser').mockResolvedValue(null);

      expect(await UserService.verifyUser('testUser', 'plaintextpassword')).toBe(false);
    });

    it('should return false if the password is incorrect', async () => {
      const mockUserVerify = { ...mockUser, password: 'hashedpassword', ID: 1, tokenUses: 1000 };

      jest.spyOn(UserService, 'getUser').mockResolvedValue(mockUserVerify);
      jest.spyOn(auth, 'comparePassword').mockResolvedValue(false);

      expect(await UserService.verifyUser('testUser', 'plaintextpassword')).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate a token if the user exists', async () => {
      const mockUserToken = { ...mockUser, ID: 1, tokenUses: 1000 };
      const mockToken = 'generatedtoken';

      jest.spyOn(UserService, 'getUser').mockResolvedValue(mockUserToken);
      jest.spyOn(User, 'update').mockResolvedValue([1]);  // Mock token update success
      jest.spyOn(auth, 'generateToken').mockReturnValue(mockToken);

      const result = await UserService.generateToken('testUser');
      expect(UserService.getUser).toHaveBeenCalledWith('testUser');
      expect(User.update).toHaveBeenCalledWith({ tokenUses: 1000 }, { where: { ID: 1 } });
      expect(auth.generateToken).toHaveBeenCalledWith('testUser');
      expect(result).toBe(mockToken);
    });

    it('should throw an error if the user does not exist', async () => {
      jest.spyOn(UserService, 'getUser').mockResolvedValue(null);

      await expect(UserService.generateToken('nonExistentUser')).rejects.toThrow(new Error('User not found'));
    });
  });

  describe('verifyToken', () => {
    it('should return a username if the token is valid', async () => {
      const mockToken = 'validtoken';
      const mockUserToken = { ...mockUser, ID: 1, tokenUses: 1000 };
      
      jest.spyOn(auth, 'verifyToken').mockResolvedValue('testUser');
      jest.spyOn(UserService, 'getUser').mockResolvedValue(mockUserToken);
      jest.spyOn(User, 'update').mockResolvedValue([1]);

      const result = await UserService.verifyToken(mockToken);
      expect(auth.verifyToken).toHaveBeenCalledWith(mockToken);
      expect(UserService.getUser).toHaveBeenCalledWith('testUser');
      expect(User.update).toHaveBeenCalledWith({ tokenUses: 999 }, { where: { ID: 1 } });
      expect(result).toBe('testUser');
    });

    it('should throw an error if the token is invalid', async () => {
      jest.spyOn(auth, 'verifyToken').mockRejectedValue(new Error('Invalid token'));

      await expect(UserService.verifyToken('invalidtoken')).rejects.toThrow(new Error('Invalid token'));
    });

    it('should throw an error if the user does not exist', async () => {
      const mockToken = 'validtoken';
      const mockUserToken = { ...mockUser, ID: 1, tokenUses: 1000 };

      jest.spyOn(auth, 'verifyToken').mockResolvedValue('testUser');
      jest.spyOn(UserService, 'getUser').mockResolvedValue(null);

      await expect(UserService.verifyToken(mockToken)).rejects.toThrow(new Error('User not found'));
    });

    it('should throw an error if the token update fails', async () => {
      const mockToken = 'validtoken';
      const mockUserToken = { ...mockUser, ID: 1, tokenUses: 0 };

      jest.spyOn(auth, 'verifyToken').mockResolvedValue('testUser');
      jest.spyOn(UserService, 'getUser').mockResolvedValue(mockUserToken);
      
      await expect(UserService.verifyToken(mockToken)).rejects.toThrow(new Error('Invalid token'));
    });
  });

  describe('getUserGroup', () => {
    it('should return the user group of the user', async () => {
      const mockUserGroup = { ...mockUser, ID: 1, tokenUses: 1000 };

      jest.spyOn(UserService, 'getUser').mockResolvedValue(mockUserGroup);

      const result = await UserService.getUserGroup('testUser');
      expect(result).toBe('testgroup');
    });

    it('should return an error if the user does not exist', async () => {
      jest.spyOn(UserService, 'getUser').mockResolvedValue(null);

      await expect(UserService.getUserGroup('nonExistentUser')).rejects.toThrow(new Error('User not found'));
    });
  });

  describe('getUserPerms', () => {
    it('should return the user permissions of the user', async () => {
      const mockUserPerms = { ...mockUser, ID: 1, tokenUses: 1000 };

      jest.spyOn(UserService, 'getUser').mockResolvedValue(mockUserPerms);

      const result = await UserService.getUserPerms('testUser');
      expect(result).toEqual({
        uploadPerm: true,
        downloadPerm: true,
        searchPerm: true,
        adminPerm: false
      });
    });

    it('should return an error if the user does not exist', async () => {
      jest.spyOn(UserService, 'getUser').mockResolvedValue(null);

      await expect(UserService.getUserPerms('nonExistentUser')).rejects.toThrow(new Error('User not found'));
    });
  })
});