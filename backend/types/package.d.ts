declare module 'package-types' {
  export interface PackageAttributes {
    ID?: number;
    name: string;
    contentUpload: boolean;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface PackageCreationAttributes extends Omit<PackageAttributes, 'ID'> {}

  export interface VersionAttributes {
    ID?: number;
    version: string;
    packageID: number;
    author: string;
    accessLevel: string;
    programPath: string; // TODO: maybe should be located in the package table
    packageUrl: string; // TODO: maybe should be located in the package table
  }
  
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface VersionCreationAttributes extends Omit<VersionAttributes, 'ID'> {}

  export interface PackageSearchResult {
    Version: string,
    ID: string,
    Name: string,
  }
  
  export interface PackageQuery {
    Version: string,
    Name: string,
  }
  
  export interface PackageQueryOptions {
    offset: number;
    limit: number;
    order: [string, string][];
    where?: {
      packageID: number[];
    };
  }
}