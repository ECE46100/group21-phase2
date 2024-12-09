import { Response } from 'express';
import { Request } from 'express-serve-static-core';
import PackageService from '../services/packageService';
import uploadUrlHandler from '../utils/packageURLUtils';
import { writePackageZip, writeZipFromTar, extractReadme, getPackageJson, debloatPackageZip } from '../utils/packageFileUtils';
import { z } from 'zod';
import { logger } from '../utils/logUtils';
import { PackageJsonFields, PackageRating } from 'package-types';
import { getRating } from '../../bridge/phase1-bridge';

const MetadataSchema = z.object({
  Name: z.string(),
  Version: z.string(),
  ID: z.number(),
});

const DataSchema = z.object({
  Name: z.string(),
  Content: z.string().optional(), // Optional for URL-based updates
  URL: z.string().optional(),
  debloat: z.boolean().default(false),
  JSProgram: z.string().optional(),
});

const ContentUpdateSchema = z.object({
  metadata: MetadataSchema,
  data: DataSchema,
});

export default async function updatePackage(req: Request, res: Response) {
  // Validate the request body against the schema

  const versionID = parseInt(req.params.id); // e.g., 123567192081501
  if (isNaN(versionID)) {
    res.status(404).send('Version does not exist.');
    return;
  }
  const version = await PackageService.getPackageVersion(versionID);
  if (!version) {
    res.status(404).send('Version does not exist.');
    return;
  }
  const existingName = await PackageService.getPackageName(version?.packageID);
  if (!existingName) {
    res.status(404).send('Package does not exist.');
    return;
  }
  
  const validationResult = ContentUpdateSchema.safeParse(req.body);
  if (!validationResult.success) {
    logger.info('Request Failed Validation');
    res.status(400).send('There is missing field(s) in the PackageID or it is formed improperly, or is invalid.');
    return;
  }

  // Cannot use both content and url
  const { metadata, data } = validationResult.data;
  if (data.Content && data.URL) {
    logger.info('Request Has both Content and URL');
    res.status(400).send('There is missing field(s) in the PackageID or it is formed improperly, or is invalid.');
    return;
  }

  // Check if the package to update exists
  const packageName = metadata.Name;
  const packageID = await PackageService.getPackageID(packageName);
  if (!packageID) {
    res.status(404).send('Package does not exist.');
    return;
  }
  // Check if the package requires content upload
  const _package = await PackageService.getPackageByID(packageID);
  if (_package?.contentUpload && !data.Content || !_package?.contentUpload && !data.URL) {
    res.status(409).send('Package ingested via Content must be updated with Content.');
    return;
  } 

  try {
    // Check if the new version already exists
    const existingVersions = await PackageService.getAllVersions(packageID);

    if (existingVersions.some((v) => v.version === metadata.Version)) {
      res.status(400).send('Version already exists.');
      return;
    }

    // Extract the major, minor, and patch versions from the incoming version
    const [incomingMajor, incomingMinor, incomingPatch] = metadata.Version.split('.').map(Number);

    // Separate existing versions into major/minor/patch levels for comparison
    const versionMap = existingVersions.reduce((acc, v) => {
      const [major, minor, patch] = v.version.split('.').map(Number);

      if (!acc[major]) acc[major] = {};
      if (!acc[major][minor]) acc[major][minor] = [];

      acc[major][minor].push(patch);
      return acc;
    }, {} as Record<number, Record<number, number[]>>);

    // Check if the incoming version violates the spec
    if (versionMap[incomingMajor]?.[incomingMinor]) {
      // If this is a patch version, ensure it's sequential
      const patches = versionMap[incomingMajor][incomingMinor];
      const maxPatch = Math.max(...patches);

      if (incomingPatch <= maxPatch) {
        res.status(400).send('Patch versions must be uploaded sequentially.');
        return;
      }
    }

    // Process the update based on Content or URL
    if (data.Content) {
      // Handle content-based update
      console.log(`Processing content-based update for ${metadata.Name}`);
      await PackageService.createVersion({
        version: metadata.Version || '1.0.0',
        packageID: packageID,
        author: req.middleware.username,
        accessLevel: 'public',
        JSProgram: data.JSProgram ?? '',
        packageUrl: '',
      });
      const createdVersionID = await PackageService.getVersionID(packageID, metadata.Version);

      await PackageService.createHistory(req.middleware.username, createdVersionID!, 'UPLOAD');

      if (!createdVersionID) {
        res.status(500).send('Error creating version.');
        return;
      }

      // Save content to file system
      if (!data.debloat) {
        await writePackageZip(packageID, createdVersionID, data.Content);
      } else {
        await debloatPackageZip(packageID, createdVersionID, data.Content);
      }

      const readmeContent = await extractReadme(packageID, createdVersionID);

      // Save README content to the database
      if (readmeContent) {
        await PackageService.updateReadme(createdVersionID, readmeContent);
      }

      const packageJson: PackageJsonFields = await getPackageJson(packageID, versionID) as PackageJsonFields;
      if (packageJson.repository && (typeof packageJson.repository === 'string' || typeof packageJson.repository.url === 'string')) {
        const packageUrl: string = typeof packageJson.repository === 'string' ? packageJson.repository : packageJson.repository.url;
        await PackageService.updatePackageUrl(versionID, packageUrl);
      } else if (packageJson.homepage && typeof packageJson.homepage === 'string' && (packageJson.homepage.includes('github.com') || packageJson.homepage.includes('npmjs.com'))) {
        await PackageService.updatePackageUrl(versionID, packageJson.homepage);
      }

      res.status(200).send('Version is updated.');
    } else if (data.URL) {
      // Handle URL-based update
      console.log(`Processing URL-based update for ${metadata.Name}`);
      const packageData = await uploadUrlHandler(data.URL);

      try {
        const rating = JSON.parse(await getRating(data.URL)) as PackageRating;
        if (rating.NetScore < 0.5) {
          res.status(424).send('URL is not rated highly enough');
          return;
        }
      } catch {
        res.status(424).send('URL is not rated highly enough');
        return;
      }
      
      await PackageService.createVersion({
        version: metadata.Version,
        packageID: packageID,
        author: req.middleware.username,
        accessLevel: 'public',
        JSProgram: data.JSProgram ?? '',
        packageUrl: data.URL,
      });

      const createdVersionID = await PackageService.getVersionID(packageID, metadata.Version);
      await PackageService.createHistory(req.middleware.username, createdVersionID!, 'UPLOAD');
      if (!createdVersionID) {
        res.status(500).send('Error creating version.');
        return;
      }

      // Save the package content from the URL
      await writeZipFromTar(packageID, createdVersionID, packageData.content);

      const readmeContent = await extractReadme(packageID, createdVersionID);

      // Save README content to the database
      if (readmeContent) {
        await PackageService.updateReadme(createdVersionID, readmeContent);
      }

      res.status(200).send('Version is updated.');
    } else {
      // Invalid request, neither content nor URL provided
      res.status(400).send('Invalid request. Either Content or URL must be provided.');
    }
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).send('Error updating package');
  }
}