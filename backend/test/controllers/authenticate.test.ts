import authenticate from '../../src/controllers/authenticate';
import UserService from '../../src/services/userService';
import { Request, Response } from 'express';

jest.mock('../../src/services/userService', () => {
  const actualService = jest.requireActual('../../src/services/userService');
  return {
    ...actualService,
    verifyUser: jest.fn(),
    generateToken: jest.fn(),
  };
});

describe('authenticate', () => {
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

  test('should return 400 for invalid request body', async () => {
    mockRequest.body = {}; // Invalid request body

    await authenticate(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(sendMock).toHaveBeenCalledWith('Invalid request');
  });

  test('should return 200 and token for valid request and valid user', async () => {
    mockRequest.body = {
      User: { name: 'testuser', isAdmin: false },
      Secret: { password: 'testpassword' },
    };

    // Mock UserService methods
    jest.spyOn(UserService, 'verifyUser').mockResolvedValue(true);
    jest.spyOn(UserService, 'generateToken').mockResolvedValue('mocked_token');

    await authenticate(mockRequest as Request, mockResponse as Response);

    expect(UserService.verifyUser).toHaveBeenCalledWith('testuser', 'testpassword');
    expect(UserService.generateToken).toHaveBeenCalledWith('testuser');
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith('bearer mocked_token');
  });

  test('should return 401 for valid request but invalid user', async () => {
    mockRequest.body = {
      User: { name: 'testuser', isAdmin: false },
      Secret: { password: 'testpassword' },
    };

    // Mock UserService.verifyUser to return false
    jest.spyOn(UserService, 'verifyUser').mockResolvedValue(false);

    await authenticate(mockRequest as Request, mockResponse as Response);

    expect(UserService.verifyUser).toHaveBeenCalledWith('testuser', 'testpassword');
    expect(UserService.generateToken).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith('Unauthorized');
  });

  test('should return 401 when an error occurs in UserService', async () => {
    mockRequest.body = {
      User: { name: 'testuser', isAdmin: false },
      Secret: { password: 'testpassword' },
    };

    // Mock UserService.verifyUser to throw an error
    jest.spyOn(UserService, 'verifyUser').mockRejectedValue(new Error('Something went wrong'));

    await authenticate(mockRequest as Request, mockResponse as Response);

    expect(UserService.verifyUser).toHaveBeenCalledWith('testuser', 'testpassword');
    expect(UserService.generateToken).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith('Unauthorized');
  });
});
