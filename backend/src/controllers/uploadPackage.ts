import { Request, Response } from 'express';
import PackageService from '../services/packageService';
import { writePackageZip, unzipPackage } from '../utils/packageFileUtils';

interface ContentRequest {
  Content:   string;
  JSProgram: string;
  debloat:   boolean;
  Name:      string;
}

interface URLRequest {
  JSProgram: string;
  URL:       string;
}

export default async function uploadPackage(req: Request, res: Response) {
  // Check formatting of request body

  // If URL provided, pass the URL to the rating function -> rate the package
    // If the rating is successful -> fetch the package from either npm or GitHub
  
  // If content provided or URL check passed -> write package to file system
  // If write is successful -> create package and version in database
  // If create is successful -> return success message
}