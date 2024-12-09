import { Request, Response } from 'express';
import uploadPackage from '../../src/controllers/uploadPackage';
import PackageService from '../../src/services/packageService';
import uploadUrlHandler from '../../src/utils/packageURLUtils';
import { writePackageZip, writeZipFromTar, readPackageZip, debloatPackageZip, extractReadme, getPackageJson } from '../../src/utils/packageFileUtils';
import { getRating } from '../../bridge/phase1-bridge';

// Mock all dependencies with proper return types
jest.mock('../../src/services/packageService');
jest.mock('../../src/utils/packageURLUtils');
jest.mock('../../src/utils/packageFileUtils');
jest.mock('../../bridge/phase1-bridge');

describe('uploadPackage', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      middleware: {
        username: 'testuser',
        permissions: { uploadPerm: true, downloadPerm: true, searchPerm: true, adminPerm: false },
      },
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  describe('when ContentRequestSchema is valid', () => {
    it('should return 409 if the package already exists', async () => {
      const contentRequest = {
        Name: 'test-package',
        Version: '1.0.0',
        Content: 'some content',
      };
      req.body = contentRequest;
      PackageService.getPackageID = jest.fn().mockResolvedValue(true);

      await uploadPackage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.send).toHaveBeenCalledWith('Package already exists');
    });

    // it('should create a new package and version successfully', async () => {
    //   const contentRequest = {
    //     Name: 'test-package',
    //     Version: '1.0.0',
    //     Content: 'some content',
    //   };
    //   req.body = contentRequest;
    //   PackageService.getPackageID = jest.fn().mockResolvedValue(null);
    //   PackageService.createPackage = jest.fn().mockResolvedValue(undefined);
    //   PackageService.createVersion = jest.fn().mockResolvedValue(undefined);
    //   PackageService.getPackageID = jest.fn().mockResolvedValue(1);
    //   PackageService.getVersionID = jest.fn().mockResolvedValue(1);
    //   // Use mock implementations of imported functions
    //   (writePackageZip as jest.Mock).mockResolvedValue(undefined);
    //   (extractReadme as jest.Mock).mockResolvedValue('README content');
    //   (getPackageJson as jest.Mock).mockResolvedValue({ repository: { url: 'http://github.com/test' } });

    //   await uploadPackage(req as Request, res as Response);

    //   expect(res.status).toHaveBeenCalledWith(201);
    //   expect(res.send).toHaveBeenCalledWith({
    //     metadata: {
    //       Name: 'test-package',
    //       Version: '1.0.0',
    //       ID: 1,
    //     },
    //     data: {
    //       Content: 'some content',
    //       JSProgram: undefined,
    //     },
    //   });
    // });

    it('should return 409 if version already exists', async () => {
      const contentRequest = {
        Name: 'test-package',
        Version: '1.0.0',
        Content: 'some content',
      };
      req.body = contentRequest;
      PackageService.getPackageID = jest.fn().mockResolvedValue(null);
      PackageService.createPackage = jest.fn().mockResolvedValue(undefined);
      PackageService.createVersion = jest.fn().mockRejectedValue(new Error('Version already exists'));

      await uploadPackage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.send).toHaveBeenCalledWith('Version already exists');
    });

    it('should return 500 if an error occurs during package creation', async () => {
      const contentRequest = {
        Name: 'test-package',
        Version: '1.0.0',
        Content: 'some content',
      };
      req.body = contentRequest;
      PackageService.getPackageID = jest.fn().mockResolvedValue(null);
      PackageService.createPackage = jest.fn().mockResolvedValue(undefined);
      PackageService.createVersion = jest.fn().mockResolvedValue(undefined);
      // Use mock rejection for error handling
      (writePackageZip as jest.Mock).mockRejectedValue(new Error('Error writing package'));

      await uploadPackage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Error creating package');
    });
  });

  describe('when URLRequestSchema is valid', () => {
    it('should return 409 if the package already exists', async () => {
      const urlRequest = {
        URL: 'http://example.com/package.tar',
      };
      req.body = urlRequest;
      (uploadUrlHandler as jest.Mock).mockResolvedValue({ name: 'test-package', version: '1.0.0' });
      PackageService.getPackageID = jest.fn().mockResolvedValue(true);

      await uploadPackage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.send).toHaveBeenCalledWith('Package already exists');
    });

    it('should return 424 if the package URL rating is not high enough', async () => {
      const urlRequest = {
        URL: 'http://example.com/package.tar',
      };
      req.body = urlRequest;
      (uploadUrlHandler as jest.Mock).mockResolvedValue({ name: 'test-package', version: '1.0.0' });
      PackageService.getPackageID = jest.fn().mockResolvedValue(null);
      (getRating as jest.Mock).mockResolvedValue(JSON.stringify({ NetScore: 0.4 }));

      await uploadPackage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(424);
      expect(res.send).toHaveBeenCalledWith('URL is not rated highly enough');
    });

    it('should return 500 if an error occurs during URL package upload', async () => {
      const urlRequest = {
        URL: 'http://example.com/package.tar',
      };
      req.body = urlRequest;
      (uploadUrlHandler as jest.Mock).mockResolvedValue({ name: 'test-package', version: '1.0.0' });
      PackageService.getPackageID = jest.fn().mockResolvedValue(null);
      (getRating as jest.Mock).mockResolvedValue(JSON.stringify({ NetScore: 0.9 }));
      PackageService.createPackage = jest.fn().mockResolvedValue(undefined);
      PackageService.createVersion = jest.fn().mockResolvedValue(undefined);
      // Use mock rejection for error handling
      (writeZipFromTar as jest.Mock).mockRejectedValue(new Error('Error writing zip'));

      await uploadPackage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Error creating package');
    });
  });

  describe('when the request is invalid', () => {
    it('should return 400 for invalid request body', async () => {
      req.body = { invalidField: 'test' };

      await uploadPackage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Invalid request');
    });
  });
});
