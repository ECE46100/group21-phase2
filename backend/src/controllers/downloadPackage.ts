import { Request, Response } from 'express';
import PackageService from '../services/packageService';
import { readPackageZip } from '../utils/packageFileUtils';

export default async function downloadPackage(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || isNaN(parseInt(id))) {
    res.status(404).send('Package not found');
    return;
  }

  const ID = parseInt(id);

  const versionObj = await PackageService.getPackageVersion(ID);
  if (!versionObj) {
    res.status(404).send('Package not found');
    return;
  }
  
  try {
    const packageZip = await readPackageZip(versionObj.packageID, versionObj.ID);
    res.status(200).send({
      metadata: {
        Name: await PackageService.getPackageName(versionObj.packageID),
        Version: versionObj.version,
        ID: id,
      },
      data: {
        Content: packageZip,
        JSProgram: versionObj.JSProgram, 
      }
    });
  } catch {
    res.status(500).send('Error reading package');
    return;
  }
}