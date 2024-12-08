import { Request, Response } from 'express';
import deleteUser from '../../src/controllers/deleteUser';
import UserService from '../../src/services/userService';

jest.mock('../../src/services/userService');

describe('deleteUser Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {
        username: 'user1',
        deleteName: 'user2',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it('should return 400 if validation fails due to missing fields', async () => {
    req.body = { username: 'user1' }; // Missing deleteName
    await deleteUser(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      'There is missing field(s) in the request data or it is formed improperly, or is invalid.'
    );
  });

  it('should return 400 if user does not exist', async () => {
    // Mock service to return null for non-existent user
    (UserService.getUser as jest.Mock).mockResolvedValueOnce(null); // user1 doesn't exist
    await deleteUser(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Not a valid User');
  });

  it('should return 400 if user to delete does not exist', async () => {
    // Mock service to return an existing user but deleteName does not exist
    (UserService.getUser as jest.Mock).mockResolvedValueOnce({
      username: 'user1',
      password: 'password',
      uploadPerm: true,
      downloadPerm: true,
      searchPerm: true,
      adminPerm: false,
      userGroup: 'group',
      tokenUses: 0, // Added tokenUses
    });
    (UserService.getUser as jest.Mock).mockResolvedValueOnce(null); // user2 doesn't exist

    await deleteUser(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('The user to delete does not exists.');
  });

  it('should return 400 if non-admin tries to delete another user', async () => {
    // Mock non-admin user
    (UserService.getUser as jest.Mock).mockResolvedValueOnce({
      username: 'user1',
      password: 'password',
      uploadPerm: true,
      downloadPerm: true,
      searchPerm: true,
      adminPerm: false,
      userGroup: 'group',
      tokenUses: 0, // Added tokenUses
    });
    // Mock another existing user
    (UserService.getUser as jest.Mock).mockResolvedValueOnce({
      username: 'user2',
      password: 'password',
      uploadPerm: true,
      downloadPerm: true,
      searchPerm: true,
      adminPerm: false,
      userGroup: 'group',
      tokenUses: 0, // Added tokenUses
    });

    await deleteUser(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Only admin can delete other users. Non-admin can only delete self.');
  });

  it('should return 400 if user tries to delete self but deleteName is different', async () => {
    // Mock non-admin user
    req.body = { username: 'user1', deleteName: 'user2' };
    (UserService.getUser as jest.Mock).mockResolvedValueOnce({
      username: 'user1',
      password: 'password',
      uploadPerm: true,
      downloadPerm: true,
      searchPerm: true,
      adminPerm: false,
      userGroup: 'group',
      tokenUses: 0, // Added tokenUses
    });
    // Mock another existing user
    (UserService.getUser as jest.Mock).mockResolvedValueOnce({
      username: 'user2',
      password: 'password',
      uploadPerm: true,
      downloadPerm: true,
      searchPerm: true,
      adminPerm: false,
      userGroup: 'group',
      tokenUses: 0, // Added tokenUses
    });

    await deleteUser(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Only admin can delete other users. Non-admin can only delete self.');
  });

  it('should return 200 if user is deleted successfully by an admin', async () => {
    // Mock admin user
    (UserService.getUser as jest.Mock).mockResolvedValueOnce({
      username: 'admin',
      password: 'password',
      uploadPerm: true,
      downloadPerm: true,
      searchPerm: true,
      adminPerm: true,
      userGroup: 'adminGroup',
      tokenUses: 0, // Added tokenUses
    });
    // Mock user to delete
    (UserService.getUser as jest.Mock).mockResolvedValueOnce({
      username: 'user2',
      password: 'password',
      uploadPerm: true,
      downloadPerm: true,
      searchPerm: true,
      adminPerm: false,
      userGroup: 'group',
      tokenUses: 0, // Added tokenUses
    });

    await deleteUser(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('User deleted successfully.');
  });

  it('should return 500 if there is an error during deletion', async () => {
    // Mock admin user
    (UserService.getUser as jest.Mock).mockResolvedValueOnce({
      username: 'admin',
      password: 'password',
      uploadPerm: true,
      downloadPerm: true,
      searchPerm: true,
      adminPerm: true,
      userGroup: 'adminGroup',
      tokenUses: 0, // Added tokenUses
    });
    // Mock user to delete
    (UserService.getUser as jest.Mock).mockResolvedValueOnce({
      username: 'user2',
      password: 'password',
      uploadPerm: true,
      downloadPerm: true,
      searchPerm: true,
      adminPerm: false,
      userGroup: 'group',
      tokenUses: 0, // Added tokenUses
    });

    // Simulate error in deleteUser method
    (UserService.deleteUser as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

    await deleteUser(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error deleting user.');
  });
});
