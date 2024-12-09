/**
 * @fileoverview This file contains the types for the package database model, version database model, and other types related to packages.
 */

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
    accessLevel: string; // put '' if is not secret, otherwise put name of the userGroup
    JSProgram: string; // TODO: maybe should be located in the package table
    packageUrl: string; // TODO: maybe should be located in the package table
    readme?: string;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  // export interface VersionCreationAttributes extends Omit<VersionAttributes, 'ID'> {}
  // CLS modified the following since we might need to create version with a specific version ID in update
  export interface VersionCreationAttributes extends Omit<VersionAttributes, 'ID'> { 
    ID?: number; // Optional to allow for manual insertion
    readme?: string;
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

  /* Expected schema for github package.json */
  export interface GitHubPackageJson {
    content: string;
  }

  /* Expected schema for package.json */
  export interface PackageJsonFields {
    repository: string | { url: string };
    homepage: string;
    name: string;
    version: string;
  }

  /* Expected schema for package rating */
  export interface PackageRating {
    BusFactor: number,
    BusFactorLatency: number,
    Correctness: number,
    CorrectnessLatency: number,
    RampUp: number,
    RampUpLatency: number,
    ResponsiveMaintainer: number,
    ResponsiveMaintainerLatency: number,
    LicenseScore: number,
    LicenseScoreLatency: number,
    GoodPinningPractice: number,
    GoodPinningPracticeLatency: number,
    PullRequest: number,
    PullRequestLatency: number,
    NetScore: number,
    NetScoreLatency: number
  }
}