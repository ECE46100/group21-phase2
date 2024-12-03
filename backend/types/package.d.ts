declare module 'package-types' {
  /* Package Database Model */
  export interface PackageAttributes {
    ID?: number;
    name: string;
    contentUpload: boolean;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface PackageCreationAttributes extends Omit<PackageAttributes, 'ID'> {}

  /* Version Database Model */
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
  // export interface VersionCreationAttributes extends Omit<VersionAttributes, 'ID'> {}
  // CLS modified the following since we might need to create version with a specific version ID in update
  export interface VersionCreationAttributes extends Omit<VersionAttributes, 'ID'> { 
    ID?: number; // Optional to allow for manual insertion
  }

  /* Item in package search result */
  export interface PackageSearchResult {
    Version: string,
    ID: string,
    Name: string,
  }
  
  /* Item in package query */
  export interface PackageQuery {
    Version: string,
    Name: string,
  }
  
  /* Configuration for querying database for packages */
  export interface PackageQueryOptions {
    offset: number;
    limit: number;
    order: [string, string][];
    where?: {
      packageID: number[];
    };
  }

  /* Return type of url utils */
  export interface PackageUrlObject {
    name: string;
    version: string;
    content: Buffer;
  }

  /* Expected schema for npm api */
  export interface NPMResponse {
    name: string;
    version: string;
    dist: {
      tarball: string;
    }
  }

  /* Expected schema for github api */
  export interface GitHubResponse {
    name: string;
  }
}