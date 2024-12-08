import { Request, Response } from 'express';
import getHistory from '../../src/controllers/getHistory';
import PackageService from '../../src/services/packageService';

jest.mock('../../src/services/packageService');

describe('getHistory Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      params: {
        name: 'test-package',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  it('should return 400 if the name parameter is missing', async () => {
    req.params = {}; // Missing name
    await getHistory(req as Request, res as Response, 'UPLOAD');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Invalid request: Missing or improperly formatted ID in the request.');
  });

  it('should return 400 if the action is invalid', async () => {
    await getHistory(req as Request, res as Response, 'INVALID_ACTION');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Invalid action: INVALID_ACTION. Allowed actions are UPLOAD, SEARCH, DOWNLOAD, RATE.');
  });

  it('should return 200 and history data if the action is valid and history is found', async () => {
    const mockHistory = [{ Name: 'test-package', action: 'UPLOAD', timestamp: '2024-12-08' }];
    (PackageService.getPackageHistory as jest.Mock).mockResolvedValueOnce(mockHistory); // Mock package history

    await getHistory(req as Request, res as Response, 'UPLOAD');

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockHistory);
  });

  it('should return 500 if there is an error fetching the history', async () => {
    (PackageService.getPackageHistory as jest.Mock).mockRejectedValueOnce(new Error('Database error')); // Simulating an error

    await getHistory(req as Request, res as Response, 'UPLOAD');

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error getting UPLOAD history of package test-package.');
  });
});
