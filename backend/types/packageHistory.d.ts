/**
 * @file packageHistory.d.ts
 * This file contains the types for the package history feature.
 */

declare module 'package-history-types' {  
    
    export interface HistoryPackageEntry { // need better naming
        Name: string,
        Version: string,
        ID: string,
    }

    export type PackageAction = 'UPLOAD' | 'SEARCH' | 'DOWNLOAD' | 'RATE';
    
    export interface PackageHistoryAttributes {
      ID?: number,
      User: string,
      Date: string; // ISO-8601 DateTime in UTC.
      PackageMetadata: HistoryPackageEntry,
      Action: PackageAction,
    }

    export interface HistoryResult { // just return who and when
      User: string,
      Date: string,
      Version: string,
    }
}