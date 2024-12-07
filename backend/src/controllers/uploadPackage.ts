import { Response } from 'express';
import { Request } from 'express-serve-static-core';
import PackageService from '../services/packageService';
import uploadUrlHandler  from '../utils/packageURLUtils';
import { writePackageZip, writeZipFromTar, readPackageZip, debloatPackageZip, getPackageJson, extractReadme } from '../utils/packageFileUtils';
import { logger } from '../utils/logUtils';
import { PackageJsonFields } from 'package-types';
import { z } from 'zod';

const ContentRequestSchema = z.object({
  Version: z.string().default('1.0.0'),
  Content: z.string(),
  JSProgram: z.string().optional(),
  debloat: z.boolean().default(false),
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
  logger.info(`body: , ${JSON.stringify(req.body)}`);
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
      try {
        await PackageService.createPackage({ 
          name: name,
          contentUpload: true,
        });
      } catch {
        res.status(409).send('Package already exists');
        return;
      }
      const packageID = await PackageService.getPackageID(name);
      try {
        await PackageService.createVersion({
          version: contentRequest.Version,
          packageID: packageID!,
          author: req.middleware.username,
          accessLevel: 'public',
          JSProgram: contentRequest.JSProgram ?? '',
          packageUrl: '',
        });
      } catch {
        res.status(409).send('Version already exists');
        return;
      }

      const versionID = await PackageService.getVersionID(packageID!, contentRequest.Version);

      // Write the package to the file system
      if (contentRequest.debloat) {
        await debloatPackageZip(packageID!, versionID!, contentRequest.Content);
      } else {
        await writePackageZip(packageID!, versionID!, contentRequest.Content);
      }

      const readmeContent = await extractReadme(packageID!, versionID!);

      // Save README content to the database
      if (readmeContent) {
        // console.log("README Content:");
        // console.log(readmeContent); // Print the README content
        await PackageService.updateReadme(versionID!, readmeContent);
      }
      
      const packageJson: PackageJsonFields = await getPackageJson(packageID!, versionID!) as PackageJsonFields;
      if (packageJson.repository && (typeof packageJson.repository === 'string' || typeof packageJson.repository.url === 'string')) {
        const packageUrl: string = typeof packageJson.repository === 'string' ? packageJson.repository : packageJson.repository.url;
        await PackageService.updatePackageUrl(versionID!, packageUrl);
      } else if (packageJson.homepage && typeof packageJson.homepage === 'string' && (packageJson.homepage.includes('github.com') || packageJson.homepage.includes('npmjs.com'))) {
        await PackageService.updatePackageUrl(versionID!, packageJson.homepage);
      }

      const response = {
        metadata: {
          Name: name,
          Version: contentRequest.Version,
          ID: versionID!,
        },
        data: {
          Content: contentRequest.Content,
          JSProgram: contentRequest.JSProgram,
        }
      }
      await PackageService.createHistory(req.middleware.username, versionID!, 'UPLOAD');
      res.status(201).send(response);
      return;
    } catch (err) {
      logger.error(err);
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
        JSProgram: urlRequest.JSProgram ?? '',
        packageUrl: urlRequest.URL,
      });
      const versionID = await PackageService.getVersionID(packageID!, packageData.version);
      await PackageService.createHistory(req.middleware.username, versionID!, 'UPLOAD');
      await writeZipFromTar(packageID!, versionID!, packageData.content);
      const zippedContents = await readPackageZip(packageID!, versionID!);

      const readmeContent = await extractReadme(packageID!, versionID!);

      // Save README content to the database
      if (readmeContent) {
        // console.log("README Content:");
        // console.log(readmeContent); // Print the README content
        await PackageService.updateReadme(versionID!, readmeContent);
      }

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
      res.status(201).send(response);
      return;
    } catch (err) {
      logger.error(err);
      res.status(500).send('Error creating package');
      return;
    }
  } else {
    res.status(400).send('Invalid request');
    return;
  }
}