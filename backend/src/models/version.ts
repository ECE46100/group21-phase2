import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';

export interface VersionAttributes {
  ID?: number;
  version: string;
  packageID: number;
  author: string;
  accessLevel: string;
  programPath: string; // TODO: maybe should be located in the package table
  packageUrl: string; // TODO: maybe should be located in the package table
}

export interface VersionCreationAttributes extends Omit<VersionAttributes, 'ID'> {}

export class Version extends Model<VersionAttributes, VersionCreationAttributes> implements VersionAttributes {
  public ID!: number;
  public version!: string;
  public packageID!: number;
  public author!: string;
  public accessLevel!: string;
  public timestamp!: Date;
  public programPath!: string;
  public packageUrl!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Version.init({
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  version: {
    type: new DataTypes.STRING(128),
    allowNull: false
  },
  packageID: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  author: {
    type: new DataTypes.STRING(128),
    allowNull: false
  },
  accessLevel: {
    type: new DataTypes.STRING(128),
    allowNull: true
  },
  programPath: {
    type: new DataTypes.STRING(128),
    allowNull: true
  },
  packageUrl: {
    type: new DataTypes.STRING(128),
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'versions',
  timestamps: true
});
