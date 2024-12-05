declare module 'package-history-types' {  
    
    export interface HistoryUserEntry {
        name: string,
        isAdmin: boolean,
    }
    
    export interface HistoryPackageEntry { // need better naming
        name: string,
        version: string,
        ID: string,
    }

    export type PackageAction = 'CREATE' | 'UPDATE' | 'DOWNLOAD' | 'RATE';
    
    export interface PackageHistoryAttributes {
      ID?: number,
      User: HistoryUserEntry,
      Date: string; // ISO-8601 DateTime in UTC.
      PackageMetadata: HistoryPackageEntry,
      Action: PackageAction,
    }

    export interface HistoryResult { // just return who and when
      User: HistoryUserEntry,
      Date: string,
    }
}