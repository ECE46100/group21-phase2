import { Package } from '../models/package';
import { Version } from '../models/version';
import { PackageCreationAttributes, VersionCreationAttributes } from 'package-types';
import { PackageSearchResult, PackageQuery, PackageQueryOptions } from 'package-types';
import { satisfies } from 'semver';
import { Op } from 'sequelize';

class PackageService {
  public async getPackageID(packageName: string): Promise<number | null> {
    const packageObj = await Package.findOne({ where: { name: packageName } });
    return packageObj ? packageObj.ID : null;
  }

  public async getPackageByID(packageID: number): Promise<Package | null> {
    return await Package.findByPk(packageID);
  }  

  public async getPackageName(packageID: number): Promise<string | null> {
    const packageObj = await Package.findByPk(packageID);
    return packageObj ? packageObj.name : null;
  }
  
  public async getPackageVersion(versionID: number): Promise<Version | null> {
    return await Version.findByPk(versionID);
  }

  public async getAllVersions(packageID: number): Promise<Version[]> {
    return await Version.findAll({
      where: { packageID },
      order: [['createdAt', 'ASC']],
    });
  }  

  public async getVersionID(packageID: number, version: string): Promise<number | null> {
    const versionObj = await Version.findOne({ where: { packageID, version } });
    return versionObj ? versionObj.ID : null;
  }

  public async getPackagesBySemver(packageQueries: PackageQuery[], queryOffset: number, semverOffset: number): Promise<[number, number, PackageSearchResult[]]> {
    const queryMetadata = new Map<number, PackageQuery>();
    
    for (const query of packageQueries) {
      const packageID = await this.getPackageID(query.Name);
      if (packageID === null) {
        continue;
      }
      queryMetadata.set(packageID, query);
    }

    const packageIDs = Array.from(queryMetadata.keys());

    const query: PackageQueryOptions = {
      offset: 50 * queryOffset,
      limit: 50,
      order: [['createdAt', 'ASC']] as [string, string][]
    };
    
    if (packageQueries[0].Name !== "*") {
      query.where = { packageID: packageIDs };
    }

    let matchingPackagesCount = 0;
    const result : [number, number, PackageSearchResult[]] = [queryOffset, semverOffset, []];

    while (matchingPackagesCount < 50) {
      const versions = await Version.findAndCountAll(query);

      if (versions.count === 0 || versions.rows.length === 0) {
        result[0] = -1;
        result[1] = -1;
        return result;
      }

      for (const version of versions.rows) {
        const semVer = packageQueries[0].Name !== "*" ? queryMetadata.get(version.packageID)?.Version : packageQueries[0].Version;

        if (semVer && satisfies(version.version, semVer)) {
          if (result[0] !== queryOffset || result[1] >= semverOffset) {
            result[2].push({
              Version: version.version,
              ID: version.ID.toString(),
              Name: (await Package.findByPk(version.packageID))?.name ?? "Unknown"
            });
            matchingPackagesCount++;
          }
          result[1]++;
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

  /**
   * Get packages that match a regex pattern in their name or description.
   *
   * @param regex - The regex pattern as a string.
   * @param queryOffset - Offset for pagination.
   * @param semverOffset - Semver-based offset for finer pagination.
   * @returns A tuple: [queryOffset, semverOffset, matching packages].
   */
  public async getPackagesByRegex(regex: string, queryOffset: number, semverOffset: number): Promise<[number, number, PackageSearchResult[]]> {
    const regexObj = new RegExp(regex, "i"); // Case-insensitive regex
    const result: [number, number, PackageSearchResult[]] = [queryOffset, semverOffset, []];
    const matchingPackagesCount = 50;

    try {
      // Query the database for matching packages
      const matchingPackages = await Package.findAndCountAll({
        where: {
          [Op.or]: [
            { name: { [Op.regexp]: regexObj.source } }
          ]
        },
        offset: queryOffset * matchingPackagesCount,
        limit: matchingPackagesCount,
        order: [['createdAt', 'ASC']]
      });

      // Map the results to include versions and semver pagination
      for (const pkg of matchingPackages.rows) {
        const versions = await Version.findAll({
          where: { packageID: pkg.ID },
          order: [['createdAt', 'ASC']],
          offset: semverOffset,
          limit: matchingPackagesCount
        });

        for (const version of versions) {
          result[2].push({
            ID: version.ID.toString(),
            Name: pkg.name,
            Version: version.version
          });
        }
      }

      // Return updated offsets and the results
      result[0] += matchingPackages.rows.length > 0 ? 1 : 0;
      result[1] += semverOffset + matchingPackages.rows.length;
    } catch (err) {
      console.error("Error fetching packages by regex:", err);
      result[0] = -1; // Indicates failure
      result[1] = -1;
    }

    return result;
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

export default new PackageService();