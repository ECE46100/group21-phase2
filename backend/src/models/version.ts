import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';
import { VersionAttributes, VersionCreationAttributes } from 'package-types';

export class Version extends Model<VersionAttributes, VersionCreationAttributes> implements VersionAttributes {
  public ID!: number;
  public version!: string;
  public packageID!: number;
  public author!: string;
  public accessLevel!: string;
  public timestamp!: Date;
  public JSProgram!: string;
  public packageUrl!: string;
  public readme?: string;

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
  JSProgram: {
    type: new DataTypes.STRING(128),
    allowNull: true
  },
  packageUrl: {
    type: new DataTypes.STRING(128),
    allowNull: true
  },
  readme: {
    type: DataTypes.TEXT, // Use TEXT for large README content
    allowNull: true,
  }
}, {
  sequelize,
  tableName: 'versions',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['packageID', 'version']
    }
  ]
});
