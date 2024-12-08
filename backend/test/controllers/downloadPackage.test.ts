import { Request, Response } from 'express';
import downloadPackage from '../../src/controllers/downloadPackage';
import PackageService from '../../src/services/packageService';
import { readPackageZip } from '../../src/utils/packageFileUtils';

jest.mock('../../src/services/packageService');
jest.mock('../../src/utils/packageFileUtils');

describe('downloadPackage Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      params: {
        id: '1',
      },
      middleware: {
        username: 'testuser',
        permissions: { uploadPerm: true, downloadPerm: true, searchPerm: true, adminPerm: false }, // Mock permissions
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it('should return 404 if the package ID is missing or invalid', async () => {
    req.params!.id = 'abc'; // Invalid ID
    await downloadPackage(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('Package not found');
  });

  it('should return 404 if the package version is not found', async () => {
    (PackageService.getPackageVersion as jest.Mock).mockResolvedValueOnce(null); // No version found
    await downloadPackage(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('Package not found');
  });

  it('should return 500 if there is an error reading the package zip', async () => {
    const versionObj = { packageID: 1, ID: 1, version: '1.0', JSProgram: 'jsProgram' };
    (PackageService.getPackageVersion as jest.Mock).mockResolvedValueOnce(versionObj);
    (readPackageZip as jest.Mock).mockRejectedValueOnce(new Error('Error reading zip')); // Simulating error while reading zip

    await downloadPackage(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error reading package');
  });

  it('should return 200 and the correct package data if the package is found and downloaded successfully', async () => {
    const versionObj = { packageID: 1, ID: 1, version: '1.0', JSProgram: 'jsProgram' };
    const mockZipContent = Buffer.from('mockZipContent');
    
    // Mock service methods
    (PackageService.getPackageVersion as jest.Mock).mockResolvedValueOnce(versionObj);
    (PackageService.getPackageName as jest.Mock).mockResolvedValueOnce('PackageName');
    (readPackageZip as jest.Mock).mockResolvedValueOnce(mockZipContent);

    await downloadPackage(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      metadata: {
        Name: 'PackageName',
        Version: '1.0',
        ID: '1',
      },
      data: {
        Content: mockZipContent,
        JSProgram: 'jsProgram',
      },
    });
    expect(PackageService.createHistory).toHaveBeenCalledWith('testuser', 1, 'DOWNLOAD');
  });

  it('should handle errors gracefully and return 500 on unexpected errors', async () => {
    const versionObj = { packageID: 1, ID: 1, version: '1.0', JSProgram: 'jsProgram' };
    (PackageService.getPackageVersion as jest.Mock).mockResolvedValueOnce(versionObj);
    (readPackageZip as jest.Mock).mockRejectedValueOnce(new Error('Unexpected error'));

    await downloadPackage(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error reading package');
  });
});
