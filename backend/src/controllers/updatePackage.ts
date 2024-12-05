import { Response } from 'express';
import { Request } from 'express-serve-static-core';
import PackageService from '../services/packageService';
import uploadUrlHandler from '../utils/packageURLUtils';
import { writePackageZip, writeZipFromTar } from '../utils/packageFileUtils';
import { z } from 'zod';
import semver from 'semver';
import path from 'path';

// Where to save the updated zip, the path field in version model
const packageDir = path.join(__dirname, '..', '..', 'packages');

const MetadataSchema = z.object({
  Name: z.string(),
  Version: z.string(),
  ID: z.string(),
});

const DataSchema = z.object({
  Name: z.string(),
  Content: z.string().optional(), // Optional for URL-based updates
  URL: z.string().optional(),
  debloat: z.boolean(),
  JSProgram: z.string().optional(),
});

const ContentUpdateSchema = z.object({
  metadata: MetadataSchema,
  data: DataSchema,
});

export default async function updatePackage(req: Request, res: Response) {
  const versionID = parseInt(req.params.id); // e.g., 123567192081501

  // Check if the versionID is valid
  if (!versionID || versionID <= 0) {
    res.status(400).send('There is missing field(s) in the PackageID or it is formed improperly, or is invalid.');
    return;
  }

  // Validate the request body against the schema
  const validationResult = ContentUpdateSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).send('There is missing field(s) in the PackageID or it is formed improperly, or is invalid.');
    return;
  }

  const { metadata, data } = validationResult.data;

  // Check if the package to update exists
  const packageName = metadata.Name;
  const packageID = await PackageService.getPackageID(packageName);
  if (!packageID) {
    res.status(404).send('Package does not exist.');
    return;
  }

  try {
    // Check if the new version already exists
    const existingVersions = await PackageService.getAllVersions(packageID);
    if (existingVersions.some((v) => v.version === metadata.Version)) {
      const latestVersion = existingVersions
        .map((v) => v.version)
        .sort(semver.compare)
        .pop();

      if (latestVersion) {
        // Increment the version to the next patch version
        metadata.Version = semver.inc(latestVersion, 'patch')!;
        console.log(`Version already exists. Incrementing to next patch version: ${metadata.Version}`);
      } else {
        // Fallback to default version
        metadata.Version = '1.0.0';
        console.log(`No valid version found. Setting to default: ${metadata.Version}`);
      }
    }

    const programPath = path.join(packageDir, `${packageID}-${versionID}.zip`);

    // Process the update based on Content or URL
    if (data.Content) {
      // Handle content-based update
      console.log(`Processing content-based update for ${metadata.Name}`);
      if (!await PackageService.getPackageVersion(versionID)) {
        // Create version with specific versionID
        await PackageService.createVersion({
          ID: versionID,
          version: metadata.Version,
          packageID: packageID,
          author: req.middleware.username,
          accessLevel: 'public',
          programPath: programPath,
          packageUrl: '',
        });
      } else {
        // Create version without specific versionID
        await PackageService.createVersion({
          version: metadata.Version,
          packageID: packageID,
          author: req.middleware.username,
          accessLevel: 'public',
          programPath: programPath,
          packageUrl: '',
        });
      }

      const createdVersionID = await PackageService.getVersionID(packageID, metadata.Version);
      if (!createdVersionID) {
        res.status(500).send('Error creating version.');
        return;
      }

      // Save content to file system
      writePackageZip(packageID, createdVersionID, data.Content);
      res.status(200).send('Version is updated.');
    } else if (data.URL) {
      // Handle URL-based update
      // console.log(`Processing URL-based update for ${metadata.Name}`);
      const packageData = await uploadUrlHandler(data.URL);

      if (!await PackageService.getPackageVersion(versionID)) {
        // Create version with specific versionID
        await PackageService.createVersion({
          ID: versionID,
          version: metadata.Version,
          packageID: packageID,
          author: req.middleware.username,
          accessLevel: 'public',
          programPath: '', // No path for URL-based content
          packageUrl: data.URL,
        });
      } else {
        // Create version without specific versionID
        await PackageService.createVersion({
          version: metadata.Version,
          packageID: packageID,
          author: req.middleware.username,
          accessLevel: 'public',
          programPath: '', // No path for URL-based content
          packageUrl: data.URL,
        });
      }

      const createdVersionID = await PackageService.getVersionID(packageID, metadata.Version);
      if (!createdVersionID) {
        res.status(500).send('Error creating version.');
        return;
      }

      // Save the package content from the URL
      await writeZipFromTar(packageID, createdVersionID, packageData.content);
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
