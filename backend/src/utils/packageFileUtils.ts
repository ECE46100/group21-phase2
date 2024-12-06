// TODO: Move to S3 file creation and retrieval system
// Normal fs only for local development
// Input stream to read/write must arleady be decoded

// Zip files stored as packageID-versionID
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { extract } from 'tar';
import { execSync } from 'child_process';
import s3Client from '../S3';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const unzippedDir = path.join(__dirname, '..', '..', 'unzipped');
const conversionDir = path.join(__dirname, '..', '..', 'conversion');

/**
 * Unzip an existing zipped package and place in unzipped directory for use.
 * @param packageID: number
 * @param versionID: number
 * @returns the path to the unzipped directory if successful, Error if failed
 */
export async function unzipPackage(packageID: number, versionID: number): Promise<string[]> {
  const unzippedPath = path.join(unzippedDir, `${packageID}-${versionID}`);  
  try {
    fs.mkdirSync(unzippedPath, { recursive: true });
  } catch {
    throw new Error('Failed to create unzipped directory');
  }

  try {
    const { Body } = await s3Client.send(new GetObjectCommand({
      Bucket: 'packages-group21',
      Key: `${packageID}-${versionID}.zip`,
    }));

    const zip = new AdmZip(Buffer.from(await Body!.transformToByteArray()));
    const directoryName = zip.getEntries().find(entry => entry.isDirectory)?.entryName;

    zip.extractAllTo(unzippedPath, true);

    return [unzippedPath, directoryName!];
  } catch (err: unknown) {
    throw new Error(err as string);
  }
}

/**
 * Zip a directory and return it as a string
 * @param unzippedPath: string
 * @returns base64 encoded string if successful, Error if failed
 */
export function zipPackage(unzippedPath: string): string {
  try {
    const zip = new AdmZip();
    zip.addLocalFolder(unzippedPath);
    const zipBuffer = zip.toBuffer();
    return zipBuffer.toString('base64');
  } catch (err: unknown) {
    throw new Error(err as string);
  }
}

// /**
//  * Check if a base64 encoded string is a valid zip file
//  * @param packageZip: string
//  * @returns true if valid, false otherwise
//  */
// export function isValidZip(packageZip: string): boolean {
//   try {
//     const decodedZip = Buffer.from(packageZip, 'base64');
//     const zip = new AdmZip(decodedZip);
    
//     // Try to list the entries to ensure it's a valid ZIP
//     zip.getEntries();
//     return true;
//   } catch {
//     return false;
//   }
// }

/**
 * Takes a base64 encoded string and writes it to the packages directory as a zip file
 * @param packageID: number
 * @param versionID: number
 * @param packageZip: string
 * @returns nothing if successful, Error if failed
 */
export async function writePackageZip(packageID: number, versionID: number, packageZip: string): Promise<undefined> {
  const decodedZip = Buffer.from(packageZip, 'base64');

  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: 'packages-group21',
      Key: `${packageID}-${versionID}.zip`,
      Body: decodedZip,
    }));
    return;
  } catch (err: unknown) {
    throw new Error(err as string);
  }
}

/**
 * Reads a package zip file and returns it as a base64 encoded string
 * @param packageID: number
 * @param versionID: number
 * @returns base64 encoded string if successful, Error if failed
 */
export async function readPackageZip(packageID: number, versionID: number): Promise<string> {
  try {
    const zipFile = await s3Client.send(new GetObjectCommand({
      Bucket: 'packages-group21',
      Key: `${packageID}-${versionID}.zip`,
    }));
    const encodedZip = Buffer.from(await zipFile.Body!.transformToByteArray()).toString('base64');
    return encodedZip;
  } catch {
    throw new Error('Failed to read package');
  }
}

/**
 * Converts a tar file to a zip file and writes it to the packages directory
 * @param packageID: number
 * @param versionID: number
 * @param tarFile: Buffer
 */
export async function writeZipFromTar(packageID: number, versionID: number, tarFile: Buffer): Promise<void> {
  const unzippedPath = path.join(unzippedDir, `${packageID}-${versionID}`);
  const conversionPath = path.join(conversionDir, `${packageID}-${versionID}.tar.gz`);

  try {
    fs.mkdirSync(conversionDir, { recursive: true });
    fs.writeFileSync(conversionPath, tarFile);
    fs.mkdirSync(unzippedPath, { recursive: true });
    await extract({
      file: conversionPath,
      cwd: unzippedPath,
    });
    const zippedPackage = zipPackage(unzippedPath);
    await writePackageZip(packageID, versionID, zippedPackage);

    fs.rmSync(conversionPath);
    fs.rmSync(unzippedPath, { recursive: true, force: true });
  } catch (err: unknown) {
    throw new Error(err as string);
  }
}

/**
 * Takes a package zip file and performs tree shaking to remove uneeded dependencies
 * @param packageID: number
 * @param versionID: number
 * @param packageZip: string
 */
export async function debloatPackageZip(packageID: number, versionID: number, packageZip: string): Promise<undefined> {
  // try {
  //   await writePackageZip(packageID, versionID, packageZip);
  //   const [unzippedPath, directoryName] = await unzipPackage(packageID, versionID);
  //   const depcheckOutput = execSync(`npx depcheck ${path.join(unzippedPath, directoryName)} --json`, { encoding: 'utf-8' });

  //   const result = JSON.parse(depcheckOutput) as { dependencies: string[]; devDependencies: string[] };

  //   const unusedDeps = Array.isArray(result.dependencies) ? result.dependencies : [];
  //   const unusedDevDeps = Array.isArray(result.devDependencies) ? result.devDependencies : [];

  //   const eslintOutput = execSync(`npx eslint ${path.join(unzippedPath, directoryName)} --ext .js,.ts --fix --quiet`, {
  //       encoding: 'utf-8',
  //   });

  //   const usedRequires = new Set();
  //   const requireRegex = /\brequire\(['"`](.*?)['"`]\)/g;
    
  //   eslintOutput.split('\n').forEach((line) => {
  //       let match;
  //       while ((match = requireRegex.exec(line)) !== null) {
  //           usedRequires.add(match[1]);
  //       }
  //   });
    
  //   const packageJsonPath = path.join(path.join(unzippedPath, directoryName), 'package.json');
  //   const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as { dependencies: Record<string, string>; devDependencies: Record<string, string> };

  //   for (const dep of unusedDeps) {
  //       if (!usedRequires.has(dep)) {
  //           delete packageJson.dependencies[dep];
  //       }
  //   }

  //   for (const dep of unusedDevDeps) {
  //     delete packageJson.devDependencies[dep];
  //   }

  //   fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  //   const zippedPackage = zipPackage(unzippedPath);
  //   fs.rmSync(unzippedPath, { recursive: true, force: true });
  //   await writePackageZip(packageID, versionID, zippedPackage);
  // } catch (err: unknown) {
  //   throw new Error(err as string);
  // }
  await writePackageZip(packageID, versionID, packageZip);
}

/**
 * Gets package.json for package
 * @param packageID: number
 * @param versionID: number
 * @param packageJson: string
 */
export async function getPackageJson(packageID: number, versionID: number): Promise<any> {
  try {
    const [unzippedPath, directoryName] = await unzipPackage(packageID, versionID);
    const packageJsonPath = path.join(path.join(unzippedPath, directoryName), 'package.json');
    const packageJson = fs.readFileSync(packageJsonPath, 'utf-8');
    fs.rmSync(unzippedPath, { recursive: true, force: true });

    return JSON.parse(packageJson);
  } catch (err: unknown) {
    throw new Error(err as string);
  }
}


/**
 * Extracts the README file from an unzipped package directory.
 * The README file can be in any of the following formats:
 * - README.md
 * - README.txt
 * - README (no extension)
 *
 * @param packageID - The unique identifier for the package.
 * @param versionID - The version identifier for the package.
 * @returns The content of the README file as a string if found, otherwise null.
 * @throws Error if the unzipped directory cannot be read or the README file cannot be accessed.
 */
export async function extractReadme(
  packageID: number,
  versionID: number
): Promise<string | null> {
  console.log(`-1`);
  // Construct the unzipped path dynamically
  const [unzippedPath, directoryName] = await unzipPackage(packageID, versionID);
  const targetPath = directoryName
    ? path.join(unzippedPath, directoryName)
    : unzippedPath;

  try {
    // Ensure the unzipped directory exists
    if (!fs.existsSync(unzippedPath)) {
      throw new Error(`Unzipped directory not found: ${unzippedPath}`);
    }

    // Read the directory contents
    const files = fs.readdirSync(unzippedPath);

    // Look for README files
    const readmePath = recursiveFindFile(targetPath, /^README(\.md|\.txt)?$/i);
    console.log(`Files in unzipped directory:`, files);
    if (!readmePath) {
      return null; // No README file found
    }
    
    // Read and return the content of the README file
    return fs.readFileSync(readmePath, "utf-8");
  } catch (err) {
    throw new Error(
      `Failed to extract README for package ${packageID}, version ${versionID}`
    );
  }
}

/**
 * Recursively searches for a file matching the provided regex pattern in a directory.
 *
 * @param dir - The directory to search in.
 * @param pattern - The regex pattern to match filenames.
 * @returns The full path to the first matching file, or null if no file is found.
 */
function recursiveFindFile(dir: string, pattern: RegExp): string | null {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      // Recursively search in subdirectories
      const result = recursiveFindFile(fullPath, pattern);
      if (result) {
        return result; // Return as soon as a match is found
      }
    } else if (file.isFile() && pattern.test(file.name)) {
      // Match found
      return fullPath;
    }
  }

  return null; // No match found
}