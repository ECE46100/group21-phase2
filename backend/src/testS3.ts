import { writePackageZip, unzipPackage } from "./utils/packageFileUtils";
import fs from 'fs';

export default async function testS3() {
  const packageID = 1;
  const versionID = 1;
  const zip = fs.readFileSync('underscore_base64.sample');
  await writePackageZip(packageID, versionID, zip.toString('utf-8'));
  await unzipPackage(packageID, versionID);
}

testS3();