import * as packageFileUtils from '../../src/utils/packageFileUtils';
import s3Client from '../../src/S3';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { extract } from 'tar';

jest.mock('../../src/S3');
jest.mock('adm-zip');
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  mkdirSync: jest.fn(),
}));
jest.mock('tar', () => ({
  extract: jest.fn(),
}));

const unzippedDir = path.join(__dirname, '..', '..', 'unzipped');
const packageID = 1;
const versionID = 1;

describe('PackageFileUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('unzipPackage', () => {
    it('should return the path to the unzipped directory if successful', async () => {
      const unzippedPath = path.join(unzippedDir, `${packageID}-${versionID}`);

      jest.spyOn(fs, 'mkdirSync');
      jest.spyOn(s3Client, 'send').mockResolvedValue({
        Body: { transformToByteArray: jest.fn().mockResolvedValue(Buffer.from('testzip')) },
      } as never);
      
      AdmZip.prototype.extractAllTo = jest.fn();
      AdmZip.prototype.getEntries = jest.fn().mockReturnValue([{ entryName: 'testdir', isDirectory: true }]);      

      const result = await packageFileUtils.unzipPackage(packageID, versionID);

      expect(fs.mkdirSync).toHaveBeenCalledWith(unzippedPath, { recursive: true });
      expect(s3Client.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            Bucket: 'packages-group21',
            Key: '1-1.zip',
          }),
        })
      );
      expect(AdmZip.prototype.extractAllTo).toHaveBeenCalledWith(unzippedPath, true);
      expect(result).toEqual([unzippedPath, 'testdir']);
    });

    it('should throw an error if failed to create unzipped directory', async () => {
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => { throw new Error(); });

      await expect(packageFileUtils.unzipPackage(packageID, versionID)).rejects.toThrow('Failed to create unzipped directory');
    });

    it('should throw an error if failed to unzip package', async () => {


      jest.spyOn(fs, 'mkdirSync');
      jest.spyOn(s3Client, 'send').mockResolvedValue({
        Body: { transformToByteArray: jest.fn().mockResolvedValue(Buffer.from('testzip')) },
      } as never);

      AdmZip.prototype.extractAllTo = jest.fn(() => { throw new Error(); });

      await expect(packageFileUtils.unzipPackage(packageID, versionID)).rejects.toThrow();
    });
  });

  describe('zipPackage', () => {
    it('should return a base64 encoded string if successful', () => {
      const unzippedPath = 'testpath';

      AdmZip.prototype.addLocalFolder = jest.fn();
      AdmZip.prototype.toBuffer = jest.fn().mockReturnValue(Buffer.from('testzip'));
      const result = packageFileUtils.zipPackage(unzippedPath);
      expect(AdmZip.prototype.addLocalFolder).toHaveBeenCalledWith(unzippedPath);
      expect(AdmZip.prototype.toBuffer).toHaveBeenCalled();
      expect(result).toBe(Buffer.from('testzip').toString('base64'));
    });

    it('should throw an error if failed to zip package', () => {
      const unzippedPath = 'testpath';

      AdmZip.prototype.addLocalFolder = jest.fn(() => { throw new Error(); });

      expect(() => packageFileUtils.zipPackage(unzippedPath)).toThrow();
    });
  });

  describe('writePackageZip', () => {
    it('should write a zip file', async () => {
      const zip = 'testzip';
      jest.spyOn(s3Client, 'send').mockResolvedValue({} as never);
      await packageFileUtils.writePackageZip(packageID, versionID, zip);
      expect(s3Client.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            Bucket: 'packages-group21',
            Key: '1-1.zip',
            Body: Buffer.from(zip, 'base64'),
          }),
        })
      );
    });

    it('should throw an error if failed to write zip file', async () => {
      const zip = 'testzip';

      jest.spyOn(s3Client, 'send').mockRejectedValue(new Error() as never);
      await expect(packageFileUtils.writePackageZip(packageID, versionID, zip)).rejects.toThrow();
    });
  });

  describe('readPackageZip', () => {
    it('should read a zip file', async () => {
      const zip = 'testzip';
      jest.spyOn(s3Client, 'send').mockResolvedValue({
        Body: { transformToByteArray: jest.fn().mockResolvedValue(Buffer.from(zip)) },
      } as never);
      const result = await packageFileUtils.readPackageZip(packageID, versionID);
      expect(result).toBe(Buffer.from(zip).toString('base64'));
    });
    it('should throw an error if failed to read zip file', async () => {
      jest.spyOn(s3Client, 'send').mockRejectedValue(new Error() as never);
      await expect(packageFileUtils.readPackageZip(packageID, versionID)).rejects.toThrow();
    });
  });

  // describe('writeZipFromTar', () => {
  //   it('should write a zip file from a tar file', async () => {
  //     const tar = Buffer.from('testtar');

  //     fs.writeFileSync = jest.fn();
  //     fs.rmSync = jest.fn();

  //     jest.spyOn(fs, 'mkdirSync');
  //     jest.spyOn(fs, 'writeFileSync');
  //     jest.spyOn(fs, 'rmSync');
  //     jest.spyOn(tar, 'extract').mockResolvedValue(undefined);
  //   });
  // });
});
