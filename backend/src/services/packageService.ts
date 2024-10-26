import { Package } from '../models/package';
import { Version } from '../models/version';

import type { PackageAttributes, PackageCreationAttributes } from '../models/package';
import type { VersionAttributes, VersionCreationAttributes } from '../models/version';

import { satisfies } from 'semver';

export default class PackageService {
  public async getPackageID(packageName: string): Promise<number | null> {
    const packageObj = await Package.findOne({ where: { name: packageName } });
    return packageObj ? packageObj.ID : null;
  }

  public async getPackageVersion(versionID: number): Promise<Version | null> {
    return await Version.findByPk(versionID);
  }

  public async getPackagesBySemver(packageNames: string[], semver: string, queryOffset: number, semverOffset: number): Promise<[number, number, Version[]]> {
    const query = {
      attributes: ['version', 'ID'],
      offset: 50 * queryOffset,
      limit: 50,
      where: { packageID: packageNames },
      order: ['version', 'ASC']
    }
    
    if (packageNames[0] !== "*") {
      query.where = { packageID: packageNames };
    }

    let matchingPackagesCount = 0;
    const result : [number, number, Version[]] = [queryOffset, semverOffset, []];

    while (matchingPackagesCount < 50) {
      const versions = await Version.findAndCountAll(query);
      if (versions.count === 0) {
        result[0] = -1;
        result[1] = -1;
        return result;
      }

      for (const version of versions.rows) {
        if (satisfies(version.version, semver)) {
          if (result[0] === queryOffset) {
            if (result[1] >= semverOffset) {
              result[2].push(version);
              matchingPackagesCount++;
            }
            result[1]++;
          } else {
            result[2].push(version);
            matchingPackagesCount++;
          }
        }
        if (matchingPackagesCount === 50) {
          return result;
        }
      }

      query.offset += 50;
      result[0]++;
      result[1] = 0;
    }

    return result;
  }

  public async createPackage(packageObj: PackageCreationAttributes): Promise<boolean> {
    try {
      await Package.create(packageObj);
      return true;
    } catch (err) {
      return false;
    }
  }

  public async createVersion(versionObj: VersionCreationAttributes): Promise<boolean> {
    if (await Version.findOne({ where: { version: versionObj.version, packageID: versionObj.packageID } })) {
      return false;
    }
    
    try {
      await Version.create(versionObj);
      return true;
    } catch (err) {
      return false;
    }
  }
}