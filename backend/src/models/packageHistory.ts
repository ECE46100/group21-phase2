import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';
import { PackageHistoryAttributes } from 'package-history-types';

export class PackageHistory extends Model<PackageHistoryAttributes, Omit<PackageHistoryAttributes, 'ID'>> implements PackageHistoryAttributes {
  public ID!: number;
  public User!: any; // Foreign key to the User model
  public Date!: string;
  public PackageMetadata!: any; // Foreign key to the PackageMetadata model
  public Action!: 'UPLOAD' | 'SEARCH' | 'DOWNLOAD' | 'RATE';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PackageHistory.init(
  {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    User: {
      type: DataTypes.JSON, // This could be a JSON or a foreign key referencing the `User` model.
      allowNull: false,
    },
    Date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    PackageMetadata: {
      type: DataTypes.JSON, // This could be a JSON or a foreign key referencing the `PackageMetadata` model.
      allowNull: false,
    },
    Action: {
      type: DataTypes.ENUM('UPLOAD', 'SEARCH', 'DOWNLOAD', 'RATE'),
      allowNull: false,
    },
  },
  {
    tableName: 'packageHistory',
    sequelize,
    timestamps: true,
  }
);
