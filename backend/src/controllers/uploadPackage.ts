import { Response } from 'express';
import { Request } from 'express-serve-static-core';
import PackageService from '../services/packageService';
import uploadUrlHandler  from '../utils/packageURLUtils';
import { writePackageZip, writeZipFromTar, readPackageZip, debloatPackageZip } from '../utils/packageFileUtils';
import { z } from 'zod';

const ContentRequestSchema = z.object({
  Content: z.string(),
  JSProgram: z.string().optional(),
  debloat: z.boolean(),
  Name: z.string(),
});

const URLRequestSchema = z.object({
  JSProgram: z.string().optional(),
  URL: z.string(),
});

type ValidContentRequest = z.infer<typeof ContentRequestSchema>;
type ValidURLRequest = z.infer<typeof URLRequestSchema>;

export default async function uploadPackage(req: Request, res: Response) {
  // Check formatting of request body
  if (ContentRequestSchema.safeParse(req.body).success) {
    const contentRequest = req.body as ValidContentRequest;
    // Check if the name exists in the database
    const name = contentRequest.Name;
    if (await PackageService.getPackageID(name)) {
      res.status(409).send('Package already exists');
      return;
    }
    try {
      // Create the package and version objects
      await PackageService.createPackage({ 
        name: name,
        contentUpload: true,
      });
      const packageID = await PackageService.getPackageID(name);
      await PackageService.createVersion({
        version: '1.0.0',
        packageID: packageID!,
        author: req.middleware.username,
        accessLevel: 'public',
        programPath: '', // TODO: Implement this
        packageUrl: '',
      });
      const versionID = await PackageService.getVersionID(packageID!, '1.0.0');

      // Write the package to the file system
      if (contentRequest.debloat) {
        await debloatPackageZip(packageID!, versionID!, contentRequest.Content);
      } else {
        await writePackageZip(packageID!, versionID!, contentRequest.Content);
      }

      const response = {
        metadata: {
          Name: name,
          Version: '1.0.0',
          ID: versionID!,
        },
        data: {
          Content: contentRequest.Content,
          JSProgram: contentRequest.JSProgram,
        }
      }
      res.status(200).send(response);
      return;
    } catch {
      res.status(500).send('Error creating package');
      return;
    }
  } else if (URLRequestSchema.safeParse(req.body).success) {

    const urlRequest = req.body as ValidURLRequest;
    // TODO: Rate the package before proceeding
    // TODO: Read the package.json to grab the version if it wasn't found already
    try {
      const packageData = await uploadUrlHandler(urlRequest.URL);

      const name = packageData.name;
      if (await PackageService.getPackageID(name)) {
        res.status(409).send('Package already exists');
        return;
      }
      await PackageService.createPackage({
        name: name,
        contentUpload: false,
      });
      const packageID = await PackageService.getPackageID(name);
      await PackageService.createVersion({
        version: packageData.version,
        packageID: packageID!,
        author: req.middleware.username,
        accessLevel: 'public',
        programPath: '', // TODO: Implement this
        packageUrl: urlRequest.URL,
      });
      const versionID = await PackageService.getVersionID(packageID!, packageData.version);
      await writeZipFromTar(packageID!, versionID!, packageData.content);
      const zippedContents = await readPackageZip(packageID!, versionID!);
      const response = {
        metadata: {
          Name: name,
          Version: packageData.version,
          ID: versionID!,
        },
        data: {
          Content: zippedContents,
          JSProgram: urlRequest.JSProgram,
        }
      }
      res.status(200).send(response);
      return;
    } catch {
      res.status(500).send('Error creating package');
      return;
    }
  } else {
    res.status(400).send('Invalid request');
    return;
  }
}