import { Request, Response } from 'express';
import reset from '../../src/controllers/reset';
import { Version } from '../../src/models/version';
import { Package } from '../../src/models/package';
import { User } from '../../src/models/user';
import UserService from '../../src/services/userService';
import resetBucket from '../../src/utils/resetUtil';

jest.mock('../../src/models/version');
jest.mock('../../src/models/package');
jest.mock('../../src/models/user');
jest.mock('../../src/services/userService');
jest.mock('../../src/utils/resetUtil');

describe('reset Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {}; // No params or query needed for this test
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it('should handle errors in resetting the database', async () => {
    // Mocking database reset failure
    (Version.destroy as jest.Mock).mockRejectedValue(new Error('Database error'));

    await reset(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error resetting the database and S3 bucket');
  });

  it('should handle errors in resetting the S3 bucket', async () => {
    // Mocking S3 bucket reset failure
    (resetBucket as jest.Mock).mockRejectedValue(new Error('S3 bucket reset error'));

    await reset(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error resetting the database and S3 bucket');
  });

  it('should reset the database and S3 bucket and create a default admin user', async () => {
    // Mocking successful reset process
    (Version.destroy as jest.Mock).mockResolvedValue(undefined);
    (Package.destroy as jest.Mock).mockResolvedValue(undefined);
    (User.destroy as jest.Mock).mockResolvedValue(undefined);
    (resetBucket as jest.Mock).mockResolvedValue(undefined);
    (UserService.createUser as jest.Mock).mockResolvedValue(undefined);

    await reset(req as Request, res as Response);

    expect(Version.destroy).toHaveBeenCalledWith({ where: {} });
    expect(Package.destroy).toHaveBeenCalledWith({ where: {} });
    expect(User.destroy).toHaveBeenCalledWith({ where: {} });
    expect(resetBucket).toHaveBeenCalled();
    expect(UserService.createUser).toHaveBeenCalledWith(expect.objectContaining({
      username: 'ece30861defaultadminuser',
    }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('Database and S3 bucket cleared');
  });
});
