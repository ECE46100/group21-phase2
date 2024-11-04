// TODO: Move to S3 file creation and retrieval system
// Normal fs only for local development
// Input stream to read/write must arleady be decoded

// Zip files stored as packageID-versionID
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

/**
 * Unzip an existing zipped package using JSZip and place in unzipped directory for use.
 * @param packageID: number
 * @param versionID: number
 * @returns the path to the unzipped directory if successful, Error if failed
 */
export function unzipPackage(packageID: number, versionID: number): string {
  const packagePath = path.join(__dirname, '..', '..', 'packages', `${packageID}-${versionID}.zip`);
  const unzippedDir = path.join(__dirname, '..', '..', 'unzipped', `${packageID}-${versionID}`);
  
  try {
    fs.mkdirSync(unzippedDir, { recursive: true });
  } catch (err) {
    throw new Error('Failed to create unzipped directory');
  }

  try {
    const zip = new AdmZip(packagePath);
    zip.extractAllTo(unzippedDir, true);
    return unzippedDir;
  } catch {
    throw new Error('Failed to unzip package');
  }
}

/**
 * Zip a directory and return it as a string
 * @param unzippedPath: string
 * @returns utf-8 encoded string if successful, Error if failed
 */
export function zipPackage(unzippedPath: string): string {
  try {
    const zip = new AdmZip();
    zip.addLocalFolder(unzippedPath);
    const zipBuffer = zip.toBuffer();
    return zipBuffer.toString('utf-8');
  } catch {
    throw new Error('Failed to zip package');
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
  const packagePath = path.join(__dirname, '..', '..', 'packages', `${packageID}-${versionID}.zip`);
  const decodedZip = Buffer.from(packageZip, 'base64');

  try {
    fs.mkdirSync(packagePath, { recursive: true });
    fs.writeFileSync(packagePath, decodedZip);
    return;
  } catch {
    throw new Error('Failed to write package');
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

/**
 * Updates a zip file with new content (utf-8 encoded string)
 * @param packageID: number
 * @param versionID: number
 * @param newContent: string
 */
export function updatePackageZip(packageID: number, versionID: number, newContent: string): undefined {
  const zipPath = path.join(__dirname, '..', '..', 'packages', `${packageID}-${versionID}.zip`);
  
  if (!fs.existsSync(zipPath)) {
    throw new Error('Package does not exist');
  }

  try {
    fs.rmSync(zipPath);
    fs.writeFileSync(zipPath, newContent);
  } catch (err) {
    throw new Error('Failed to update package');
  }
}