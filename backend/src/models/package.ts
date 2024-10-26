import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';

interface PackageAttributes {
  ID?: number;
  name: string;
}

interface PackageCreationAttributes extends Omit<PackageAttributes, 'ID'> {}

class Package extends Model<PackageAttributes, PackageCreationAttributes> implements PackageAttributes {
  public ID!: number;
  public name!: string;

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
}, {
  sequelize,
  tableName: 'packages',
  timestamps: true
});

export { Package, PackageAttributes, PackageCreationAttributes };