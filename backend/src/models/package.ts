import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';
import { PackageAttributes, PackageCreationAttributes } from 'package-types';


export class Package extends Model<PackageAttributes, PackageCreationAttributes> implements PackageAttributes {
  public ID!: number;
  public name!: string;
  public contentUpload!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Package.init({
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: new DataTypes.STRING(128),
    unique: true,
    allowNull: false
  },
  contentUpload: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  }
}, {
  sequelize,
  tableName: 'packages',
  timestamps: true
});
