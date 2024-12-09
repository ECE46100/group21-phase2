import { Request, Response } from 'express';
import updatePackage from '../../src/controllers/updatePackage';
import PackageService from '../../src/services/packageService';
import uploadUrlHandler from '../../src/utils/packageURLUtils';
import { writePackageZip, writeZipFromTar, extractReadme, getPackageJson } from '../../src/utils/packageFileUtils';
import { logger } from '../../src/utils/logUtils';
import { getRating } from '../../bridge/phase1-bridge';

// Mock all dependencies with proper return types
jest.mock('../../src/services/packageService');
jest.mock('../../src/utils/packageURLUtils');
jest.mock('../../src/utils/packageFileUtils');
jest.mock('../../src/utils/logUtils');
jest.mock('../../bridge/phase1-bridge');

describe('updatePackage', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    // Reset mocks before each test
    req = {
      params: { id: '123567192081501' },
      body: {},
      middleware: { 
        username: 'testuser', 
        permissions: { 
          uploadPerm: true, 
          downloadPerm: true, 
          searchPerm: true, 
          adminPerm: false 
        } 
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    
    // Properly mock the functions
    (writePackageZip as jest.Mock).mockResolvedValue(undefined); // Mock writePackageZip
    (extractReadme as jest.Mock).mockResolvedValue('README content'); // Mock extractReadme
    (getPackageJson as jest.Mock).mockResolvedValue({ repository: { url: 'http://github.com/test' } }); // Mock getPackageJson
    (uploadUrlHandler as jest.Mock).mockResolvedValue({ content: 'some content' }); // Mock uploadUrlHandler
    (getRating as jest.Mock).mockResolvedValue('4.5'); // Mock getRating (returning a string as specified)
  });

  it('should return 404 if the version does not exist', async () => {
    PackageService.getPackageVersion = jest.fn().mockResolvedValue(null);

    await updatePackage(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('Version does not exist.');
  });

  it('should return 404 if the package does not exist', async () => {
    PackageService.getPackageVersion = jest.fn().mockResolvedValue({ packageID: 1 });
    PackageService.getPackageName = jest.fn().mockResolvedValue(null);

    await updatePackage(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('Package does not exist.');
  });

  // it('should return 400 if validation fails', async () => {
  //   req.body = {}; // Invalid body

  //   await updatePackage(req as Request, res as Response);

  //   expect(res.status).toHaveBeenCalledWith(400);
  //   expect(res.send).toHaveBeenCalledWith('There is missing field(s) in the PackageID or it is formed improperly, or is invalid.');
  // });

  // it('should return 400 if both content and URL are provided', async () => {
  //   req.body = {
  //     metadata: { Name: 'test-package', Version: '1.0.0', ID: 1 },
  //     data: { Content: 'content', URL: 'http://example.com' },
  //   };

  //   await updatePackage(req as Request, res as Response);

  //   expect(res.status).toHaveBeenCalledWith(400);
  //   expect(res.send).toHaveBeenCalledWith('There is missing field(s) in the PackageID or it is formed improperly, or is invalid.');
  // });

  it('should return 404 if the package ID does not exist', async () => {
    PackageService.getPackageID = jest.fn().mockResolvedValue(null);
    req.body = { metadata: { Name: 'test-package', Version: '1.0.0', ID: 1 }, data: {} };

    await updatePackage(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('Package does not exist.');
  });

  // it('should return 409 if content update is required but no content is provided', async () => {
  //   PackageService.getPackageByID = jest.fn().mockResolvedValue({ contentUpload: true });
  //   req.body = {
  //     metadata: { Name: 'test-package', Version: '1.0.0', ID: 1 },
  //     data: { URL: 'http://example.com' },
  //   };

  //   await updatePackage(req as Request, res as Response);

  //   expect(res.status).toHaveBeenCalledWith(409);
  //   expect(res.send).toHaveBeenCalledWith('Package ingested via Content must be updated with Content.');
  // });

  // it('should return 200 and update the package with valid content', async () => {
  //   const mockCreateVersion = jest.fn().mockResolvedValue(1);
  //   PackageService.getPackageVersion = jest.fn().mockResolvedValue({ packageID: 1 });
  //   PackageService.getPackageName = jest.fn().mockResolvedValue('test-package');
  //   PackageService.getPackageID = jest.fn().mockResolvedValue(1);
  //   PackageService.getPackageByID = jest.fn().mockResolvedValue({ contentUpload: true });
  //   PackageService.createVersion = mockCreateVersion;

  //   req.body = {
  //     metadata: { Name: 'test-package', Version: '1.0.0', ID: 1 },
  //     data: { Content: 'some content' },
  //   };

  //   await updatePackage(req as Request, res as Response);

  //   expect(res.status).toHaveBeenCalledWith(200);
  //   expect(res.send).toHaveBeenCalledWith('Version is updated.');
  //   expect(mockCreateVersion).toHaveBeenCalled();
  // });


});
  // it('should return 424 if the URL is not rated highly enough', async () => {
  //   await updatePackage(req as Request, res as Response);

  //   expect(res.status).toHaveBeenCalledWith(424);
  //   expect(res.send).toHaveBeenCalledWith('URL is not rated highly enough');
  // });

  // it('should return 500 if an error occurs during the update process', async () => {
  //   PackageService.getPackageVersion = jest.fn().mockRejectedValue(new Error('Database error'));

  //   await updatePackage(req as Request, res as Response);

  //   expect(res.status).toHaveBeenCalledWith(500);
  //   expect(res.send).toHaveBeenCalledWith('Error updating package');
  // });