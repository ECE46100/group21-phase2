import { Request, Response } from 'express';
import PackageService from '../services/packageService';
// import { promise } from zod;

export default async function ratePackage(req: Request, res: Response) {
    const IDStr = req.params.id;

    if (!IDStr || isNaN(parseInt(IDStr))) {
      console.log(`in downloadPackage.ts/downloadPackage(), IDStr = ${IDStr? IDStr : 'missing'}`);
      res.status(400).send('There is missing field(s) in the PackageID');
      return;
    }
    const ID = parseInt(IDStr);
  
    const versionObj = await PackageService.getPackageVersion(ID);
    if (!versionObj) {
      res.status(404).send('Package does not exists.');
      return;
    }

    //TODO : implement rating with versionID
    try{
        const result = { // Pseudo
            BusFactor: '0.1',
            BusFactorLatency: '0.1',
            Correctness: '0.1',
            CorrectnessLatency: '0.1',
            RampUp: '0.1',
            RampUpLatency: '0.1',
            ResponsiveMaintainer: '0.1',
            ResponsiveMaintainerLatency: '0.1',
            LicenseScore: '0.1',
            LicenseScoreLatency: '0.1',
            GoodPinningPractice: '0.1',
            GoodPinningPracticeLatency: '0.1',
            PullRequest: '0.1',
            PullRequestLatency: '0.1',
            NetScore: '0.1',
            NetScoreLatency: '0.1'
        }
        res.status(200).send(result);
    } catch{
        res.status(500).send('The package rating system choked on at least one of the metrics.');
    }
    return;
}