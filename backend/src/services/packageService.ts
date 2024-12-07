import { Package } from '../models/package';
import { Version } from '../models/version';
import { PackageHistory } from '../models/packageHistory';
import { PackageCreationAttributes, VersionCreationAttributes } from 'package-types';
import { PackageSearchResult, PackageQuery, PackageQueryOptions } from 'package-types';
import { HistoryResult, PackageAction } from 'package-history-types';
import { satisfies } from 'semver';
import { Op, literal } from 'sequelize';

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
    try {
      return await Version.findAll({ 
        where: { packageID },
        order: [['createdAt', 'ASC']], 
      });
    } catch (err) {
      console.error('Error in getAllVersions:', err);
      throw new Error('Failed to retrieve versions');
    }
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
          if (result[1] === 50) {
            result[0]++;
            result[1] = 0;
          }
          return result;
        }
      }
      query.offset += 50;
      result[0]++;
      result[1] = 0;
    }

    return result;
  }

  public async createPackage(packageObj: PackageCreationAttributes): Promise<undefined> {
    try {
      await Package.create(packageObj);
      return;
    } catch (err) {
      throw new Error(err as string);
    }
  }

  public async getPackagesByRegex(regex: string): Promise<PackageSearchResult[]> {
    const regexObj = new RegExp(regex, "i"); // Case-insensitive regex
  
    try {
      const result: PackageSearchResult[] = [];
      const seenIds = new Set<string>(); // Track unique IDs

      // Search for packages by name
      const matchingPackages = await Package.findAll({
        where: {
          name: { [Op.regexp]: regexObj.source },
        },
        order: [["createdAt", "ASC"]],
      });

  
      // Fetch versions for each package and map the result
      for (const pkg of matchingPackages) {
        const versions = await this.getAllVersions(pkg.ID); // Fetch all versions for the package
  
        // Map each version as a separate result
        for (const version of versions) {
          result.push({
            // ID: pkg.ID.toString(),
            ID: version.ID.toString(), // should return versionID
            Name: pkg.name,
            Version: version.version, // Include the version
          });
          seenIds.add(version.ID.toString());
        }
      }

    // Search for versions by readme
    const matchingReadmes = await Version.findAll({
      where: {
        readme: { [Op.regexp]: regexObj.source },
      },
      order: [["createdAt", "ASC"]],
    });

    for (const version of matchingReadmes) {
      const id = version.ID.toString();
      if (!seenIds.has(id)) {
        // Fetch the package name using the packageID from the version
        const packageName = await Package.findOne({
          where: { ID: version.packageID },
          attributes: ["name"], // Only fetch the name to optimize query
        });
    
        if (packageName) {
          result.push({
            ID: id,
            Name: packageName.name, // Use the related package's name
            Version: version.version, // Include the matched version
          });
          seenIds.add(id);
        }
      }
    }
  
      return result;
    } catch (err) {
      console.error("Error in getPackagesByRegex:", err);
      throw new Error("Failed to retrieve packages");
    }
  }

  public async updateReadme(versionID: number, readmeContent: string) {
    await Version.update(
      { readme: readmeContent },
      { where: { ID: versionID } }
    );
  }
  
  public async createVersion(versionObj: VersionCreationAttributes): Promise<undefined> {
    if (await Version.findOne({ where: { version: versionObj.version, packageID: versionObj.packageID } })) {
      throw new Error("Version already exists");
    }

    try {
      await Version.create(versionObj);
      return;
    } catch (err) {
      throw new Error(err as string);
    }
  }

  public async updatePackageUrl(versionID: number, packageUrl: string): Promise<undefined> {
    try {
      await Version.update({ packageUrl: packageUrl }, { where: { ID: versionID } });
      return;
    } catch (err) {
      throw new Error(err as string);
    }
  }

  public async createHistory(userName:string, versionID: number, action:string): Promise<undefined> {
    console.log(`in createHistory, user:${userName}, versionID:${versionID}, action:${action}`);
    try {
      if (!['UPLOAD', 'SEARCH', 'DOWNLOAD', 'RATE'].includes(action)) {
        throw new Error(`action ${action} is not one of UPLOAD | SEARCH | DOWNLOAD | RATE.`);
      }
      // get the version obj
      const version = await Version.findOne({
        where: { ID: versionID },
      });
      if (!version) {
        throw new Error(`Package with versionID ${versionID} not found.`);
      }
      // get the package obj (for its name)
      const _package = await Package.findOne({
        where: { ID: version.packageID },
      })
      if (!_package) {
        throw new Error(`Package with ID ${version.packageID} not found.`);
      }

      // Construct the package metadata object
      const metadata: PackageSearchResult = {
        Name: _package.name,
        Version: version.version,
        ID: version.ID.toString(),
      };

      // Create a new history entry
      await PackageHistory.create({
        User: userName, // User who performed the action
        Date: new Date().toISOString(), // Current timestamp in ISO format
        PackageMetadata: metadata, // Metadata of the package
        Action: action as PackageAction, // The action performed
      });
      console.log(`History entry created for action ${action} on package version ${versionID}`);
    } catch (err) {
      console.error('Error creating package history:', err);
      throw new Error('Failed to create package history entry.');
    }
  }

  /**
   * Gets history of a package
   * @param packageName 
   * @param action what was performed on this version
   * @returns an array of {userName, date, version}, indicating who(user) did what(action) at when(date)
   */
  public async getPackageHistory(packageName: string, action: string): Promise<HistoryResult[]> {
    try {
      const historyRecords = await PackageHistory.findAll({
        where: {
          [Op.and]: [
            // Query `PackageMetadata` JSON for the package name
            literal(`"PackageHistory"."PackageMetadata"->>'Name' = :packageName`),
            { Action: action },
          ],
        },
        replacements: { packageName },
      });

      // Transform the results to include `Version` from `PackageMetadata`
      return historyRecords.map((record) => {
        const data = record.toJSON();
        return {
          User: data.User,
          Date: data.Date,
          Version: data.PackageMetadata?.Version ?? 'Unknown', // Safely access the version
        } as HistoryResult;
      });
    } catch (err) {
      console.error('Error fetching package history by package name:', err);
      throw new Error('Could not retrieve package history.');
    }
  }

}

export default new PackageService();