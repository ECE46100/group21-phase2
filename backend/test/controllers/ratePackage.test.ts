import { Request, Response } from 'express';
import ratePackage from '../../src/controllers/ratePackage';
import PackageService from '../../src/services/packageService';
import { getRating } from '../../bridge/phase1-bridge';

jest.mock('../../src/services/packageService');
jest.mock('../../bridge/phase1-bridge');

describe('ratePackage Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      params: {
        id: '1',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it('should return 404 if the ID parameter is missing or invalid', async () => {
    req.params = req.params || {}; // Ensure params is not undefined

    req.params.id = 'abc'; // Invalid ID
    await ratePackage(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('Package Not Found');

    req.params.id = ''; // Missing ID
    await ratePackage(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('Package Not Found');
  });

  it('should return 404 if the package version is not found', async () => {
    (PackageService.getPackageVersion as jest.Mock).mockResolvedValueOnce(null); // Simulate no version found

    await ratePackage(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('Package Not Found');
  });

  it('should return 200 and the package rating if the rating system succeeds', async () => {
    const mockRating = { score: 4.5, reviews: 120 };
    (PackageService.getPackageVersion as jest.Mock).mockResolvedValueOnce({
      packageUrl: 'http://example.com/package.zip',
    });
    (getRating as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockRating)); // Simulate successful rating

    await ratePackage(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(mockRating);
  });

  it('should return 500 if there is an error with the rating system', async () => {
    (PackageService.getPackageVersion as jest.Mock).mockResolvedValueOnce({
      packageUrl: 'http://example.com/package.zip',
    });
    (getRating as jest.Mock).mockRejectedValueOnce(new Error('Error getting rating')); // Simulate error with rating

    await ratePackage(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('The package rating system choked on at least one of the metrics.');
  });
});
