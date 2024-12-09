/**
 * @fileoverview This file contains the types for the user feature.
 */

declare module 'user-types' {
  export interface UserPerms {
    uploadPerm: boolean;
    downloadPerm: boolean;
    searchPerm: boolean;
    adminPerm: boolean;
  }

  export interface UserAttributes {
    ID?: number;
    username: string;
    password: string;
    uploadPerm: boolean;
    downloadPerm: boolean;
    searchPerm: boolean;
    adminPerm: boolean;
    userGroup: string;
    tokenUses: number;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UserCreationAttributes extends Omit<UserAttributes, 'ID' | 'tokenUses'> {}  
}