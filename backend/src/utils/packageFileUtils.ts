// TODO: Move to S3 file creation and retrieval system
// Normal fs only for local development
// Input stream to read/write must arleady be decoded

// Zip files stored as packageID-versionID
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { extract } from 'tar';

const packageDir = path.join(__dirname, '..', '..', 'packages');
const unzippedDir = path.join(__dirname, '..', '..', 'unzipped');
const conversionDir = path.join(__dirname, '..', '..', 'conversion');

/**
 * Unzip an existing zipped package and place in unzipped directory for use.
 * @param packageID: number
 * @param versionID: number
 * @returns the path to the unzipped directory if successful, Error if failed
 */
export function unzipPackage(packageID: number, versionID: number): string {
  const packagePath = path.join(packageDir, `${packageID}-${versionID}.zip`);
  const unzippedPath = path.join(unzippedDir, `${packageID}-${versionID}`);
  
  try {
    fs.mkdirSync(unzippedPath, { recursive: true });
  } catch (err) {
    throw new Error('Failed to create unzipped directory');
  }

  try {
    const zip = new AdmZip(packagePath);
    zip.extractAllTo(unzippedPath, true);
    return unzippedPath;
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

/**
 * Check if a base64 encoded string is a valid zip file
 * @param packageZip: string
 * @returns true if valid, false otherwise
 */
export function isValidZip(packageZip: string): boolean {
  try {
    const decodedZip = Buffer.from(packageZip, 'base64');
    const zip = new AdmZip(decodedZip);
    
    // Try to list the entries to ensure it's a valid ZIP
    zip.getEntries();
    return true;
  } catch {
    return false;
  }
}

/**
 * Takes a base64 encoded string and writes it to the packages directory as a zip file
 * @param packageID: number
 * @param versionID: number
 * @param packageZip: string
 * @returns nothing if successful, Error if failed
 */
export function writePackageZip(packageID: number, versionID: number, packageZip: string): undefined {
  const packagePath = path.join(packageDir, `${packageID}-${versionID}.zip`);
  const decodedZip = Buffer.from(packageZip, 'base64');

  try {
    fs.mkdirSync(packageDir, { recursive: true });
    fs.writeFileSync(packagePath, decodedZip);
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
export function readPackageZip(packageID: number, versionID: number): string {
  const packagePath = path.join(__dirname, '..', '..', 'packages', `${packageID}-${versionID}.zip`);
  if (!fs.existsSync(packagePath)) {
    throw new Error('Package does not exist');
  }
  
  try {
    const encodedZip = fs.readFileSync(packagePath).toString('base64');
    return encodedZip;
  } catch {
    throw new Error('Failed to read package');
  }
}

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
    writePackageZip(packageID, versionID, zippedPackage);

    fs.rmSync(conversionPath);
    fs.rmSync(unzippedPath, { recursive: true, force: true });
  } catch (err: unknown) {
    throw new Error(err as string);
  }
}