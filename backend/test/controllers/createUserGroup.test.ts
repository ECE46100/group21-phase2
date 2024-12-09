import createUserGroup from '../../src/controllers/createUserGroup';
import UserService from '../../src/services/userService';
import { Request, Response } from 'express';

// Mocking UserService methods
jest.mock('../../src/services/userService', () => ({
  getGroupByName: jest.fn(),
  createUserGroup: jest.fn(),
}));

describe('createUserGroup', () => {
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

  test('should return 400 for missing or invalid group name', async () => {
    mockRequest.body = {
      name: '',
      description: 'A test group',
    };

    await createUserGroup(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(sendMock).toHaveBeenCalledWith('The group name missing or is formed improperly, or is invalid.');
  });

  test('should return 400 for already taken group name', async () => {
    mockRequest.body = {
      name: 'existingGroup',
      description: 'A test group',
    };

    // Mock getGroupByName to return an existing group
    (UserService.getGroupByName as jest.Mock).mockResolvedValue(true);

    await createUserGroup(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(sendMock).toHaveBeenCalledWith('This group name is taken, please choose a different name.');
  });

  test('should return 200 for successful user group creation without description', async () => {
    mockRequest.body = {
      name: 'newGroup',
    };

    // Mock getGroupByName to return null (group does not exist)
    (UserService.getGroupByName as jest.Mock).mockResolvedValue(null);
    // Mock createUserGroup to simulate successful group creation
    (UserService.createUserGroup as jest.Mock).mockResolvedValue(undefined);

    await createUserGroup(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith('New user created.');
  });

  test('should return 200 for successful user group creation with description', async () => {
    mockRequest.body = {
      name: 'newGroup',
      description: 'A test group',
    };

    // Mock getGroupByName to return null (group does not exist)
    (UserService.getGroupByName as jest.Mock).mockResolvedValue(null);
    // Mock createUserGroup to simulate successful group creation
    (UserService.createUserGroup as jest.Mock).mockResolvedValue(undefined);

    await createUserGroup(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith('New user created.');
  });

  test('should return 500 when an error occurs during group creation', async () => {
    mockRequest.body = {
      name: 'newGroup',
      description: 'A test group',
    };

    // Mock getGroupByName to return null (group does not exist)
    (UserService.getGroupByName as jest.Mock).mockResolvedValue(null);
    // Mock createUserGroup to throw an error
    (UserService.createUserGroup as jest.Mock).mockRejectedValue(new Error('Something went wrong'));

    await createUserGroup(mockRequest as Request, mockResponse as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith('Error creating new user.');
  });
});
