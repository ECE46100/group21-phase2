import { Request, Response } from 'express';
import PackageService from '../services/packageService';
import { getRating } from '../../bridge/phase1-bridge';
import { PackageRating } from 'package-types';

export default async function ratePackage(req: Request, res: Response) {
    const IDStr = req.params.id;

    if (!IDStr || isNaN(parseInt(IDStr))) {
      console.log(`in downloadPackage.ts/downloadPackage(), IDStr = ${IDStr? IDStr : 'missing'}`);
      res.status(404).send('Package Not Found');
      return;
    }
    const ID = parseInt(IDStr);
  
    const versionObj = await PackageService.getPackageVersion(ID);
    if (!versionObj) {
      res.status(404).send('Package Not Found');
      return;
    }

    // TODO : implement rating with versionID
    const packageUrl = versionObj.packageUrl;
    try{
        const result: PackageRating = JSON.parse(await getRating(packageUrl)) as PackageRating;
        console.log(result);
        res.status(200).send(result);
    } catch{
        res.status(500).send('The package rating system choked on at least one of the metrics.');
    }
    return;
}