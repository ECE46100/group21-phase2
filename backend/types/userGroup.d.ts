declare module 'userGroup-types' {
    export interface UserGroupAttributes {
      ID?: number; // primary key
      name: string;
      description?: string; // Optional
    }
  }
  