/**
 * @file userGroup.d.ts
 * This file contains the types for the userGroup database model.
 */

declare module 'userGroup-types' {
    export interface UserGroupAttributes {
      ID?: number; // primary key
      name: string;
      description?: string; // Optional
    }
  }
  