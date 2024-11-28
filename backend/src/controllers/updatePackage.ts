import { Response } from 'express';
import { Request } from 'express-serve-static-core';
import PackageService from '../services/packageService';
import uploadUrlHandler from '../utils/packageURLUtils';
import { writePackageZip, writeZipFromTar, readPackageZip } from '../utils/packageFileUtils';
import { z } from 'zod';

const ContentUpdateSchema = z.object({
  Content: z.string(),
  JSProgram: z.string().optional(),
  debloat: z.boolean(),
  Version: z.string(), // New version
});

const URLUpdateSchema = z.object({
  JSProgram: z.string().optional(),
  URL: z.string(),
  Version: z.string(), // New version
});


type ValidContentUpdateRequest = z.infer<typeof ContentUpdateSchema>;
type ValidURLUpdateRequest = z.infer<typeof URLUpdateSchema>;

export default async function updatePackage(req: Request, res: Response) {
  const packageID = parseInt(req.params.id);

  
  if (!packageID || !(await PackageService.getPackageByID(packageID))) {
    res.status(404).send('Package does not exist');
    return;
  }

  // content-based update
  if (ContentUpdateSchema.safeParse(req.body).success) {
    const contentUpdateRequest = req.body as ValidContentUpdateRequest;

    try {
      // check if the new version is more recent
      const existingVersions = await PackageService.getAllVersions(packageID);
      if (existingVersions.map(v => v.version).includes(contentUpdateRequest.Version)) {
        res.status(400).send('Version already exists or is invalid.');
        return;
      }

      // append a new version for the package
      await PackageService.createVersion({
        version: contentUpdateRequest.Version,
        packageID: packageID,
        author: req.middleware.username,
        accessLevel: 'public',
        programPath: '', // TODO: 
        packageUrl: '',
      });
      const versionID = await PackageService.getVersionID(packageID, contentUpdateRequest.Version);
      writePackageZip(packageID, versionID!, contentUpdateRequest.Content);

      
      const response = {
        metadata: {
          ID: versionID!,
          Version: contentUpdateRequest.Version,
          PackageID: packageID,
        },
        data: {
          Content: contentUpdateRequest.Content,
          JSProgram: contentUpdateRequest.JSProgram,
        },
      };
      res.status(200).send(response);
    } catch (error) {
      console.error('Error updating package:', error);
      res.status(500).send('Error updating package');
    }

    return;
  }

  // URL-based update
  if (URLUpdateSchema.safeParse(req.body).success) {
    const urlUpdateRequest = req.body as ValidURLUpdateRequest;

    try {
      // check if the new version is more recent
      const existingVersions = await PackageService.getAllVersions(packageID);
      if (existingVersions.map(v => v.version).includes(urlUpdateRequest.Version)) {
        res.status(400).send('Version already exists or is invalid.');
        return;
      }

      // get package data from the URL
      const packageData = await uploadUrlHandler(urlUpdateRequest.URL);

      // set new version for the package
      await PackageService.createVersion({
        version: urlUpdateRequest.Version,
        packageID: packageID,
        author: req.middleware.username,
        accessLevel: 'public',
        programPath: '', // TODO
        packageUrl: urlUpdateRequest.URL,
      });
      const versionID = await PackageService.getVersionID(packageID, urlUpdateRequest.Version);
      await writeZipFromTar(packageID, versionID!, packageData.content);

      
      const response = {
        metadata: {
          ID: versionID!,
          Version: urlUpdateRequest.Version,
          PackageID: packageID,
        },
        data: {
          Content: packageData.content,
          JSProgram: urlUpdateRequest.JSProgram,
        },
      };
      res.status(200).send(response);
    } catch (error) {
      console.error('Error updating package via URL:', error);
      res.status(500).send('Error updating package via URL');
    }

    return;
  }

  // neither content nor URL based, return a 400 error
  res.status(400).send('Invalid request');
}
