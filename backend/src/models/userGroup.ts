import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';
import { UserGroupAttributes } from 'userGroup-types';

export class UserGroup extends Model<UserGroupAttributes, Omit<UserGroupAttributes, 'ID'>> implements UserGroupAttributes {
  public ID!: number;
  public name!: string;
  public description!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserGroup.init({
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: new DataTypes.STRING(128),
    allowNull: false,
    unique: true,
  },
  description: {
    type: new DataTypes.STRING(256),
    allowNull: true,
  },
}, {
  tableName: 'userGroups',
  sequelize,
  timestamps: true,
});

export default UserGroup;
