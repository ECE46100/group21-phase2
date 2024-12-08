import createUser from '../../src/controllers/createUser';
import UserService from '../../src/services/userService';
import { Request, Response } from 'express';

// Mocking UserService methods
jest.mock('../../src/services/userService', () => ({
  getUser: jest.fn(),
  createUser: jest.fn(),
}));

describe('createUser', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    sendMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ send: sendMock });
    mockRequest = {};
    mockResponse = {
      status: statusMock,
      send: sendMock,
    };
    jest.clearAllMocks();
  });

  test('should return 400 for missing or invalid fields', async () => {
    mockRequest.body = {
      username: '',
      password: 'password123',
      uploadPerm: true,
      downloadPerm: true,
      searchPerm: true,
      adminPerm: true,
      userGroup: 'group1',
    };

    await createUser(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(sendMock).toHaveBeenCalledWith('There is missing field(s) in the new user data or it is formed improperly, or is invalid.');
  });

  test('should return 400 for already taken username', async () => {
    mockRequest.body = {
      username: 'existingUser',
      password: 'password123',
      uploadPerm: true,
      downloadPerm: true,
      searchPerm: true,
      adminPerm: true,
      userGroup: 'group1',
    };

    // Mock getUser to return an existing user
    (UserService.getUser as jest.Mock).mockResolvedValue(true);

    await createUser(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(sendMock).toHaveBeenCalledWith('This username is taken, please choose a different name.');
  });

  test('should return 200 for successful user creation', async () => {
    mockRequest.body = {
      username: 'newUser',
      password: 'password123',
      uploadPerm: true,
      downloadPerm: true,
      searchPerm: true,
      adminPerm: true,
      userGroup: 'group1',
    };

    // Mock getUser to return null (user does not exist)
    (UserService.getUser as jest.Mock).mockResolvedValue(null);
    // Mock createUser to simulate successful user creation
    (UserService.createUser as jest.Mock).mockResolvedValue(undefined);

    await createUser(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith('New user created.');
  });

  test('should return 500 when an error occurs during user creation', async () => {
    mockRequest.body = {
      username: 'newUser',
      password: 'password123',
      uploadPerm: true,
      downloadPerm: true,
      searchPerm: true,
      adminPerm: true,
      userGroup: 'group1',
    };

    // Mock getUser to return null (user does not exist)
    (UserService.getUser as jest.Mock).mockResolvedValue(null);
    // Mock createUser to throw an error
    (UserService.createUser as jest.Mock).mockRejectedValue(new Error('Something went wrong'));

    await createUser(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith('Error creating new user.');
  });
});
