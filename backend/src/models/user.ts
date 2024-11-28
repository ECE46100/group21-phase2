import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';
import { UserAttributes, UserCreationAttributes } from 'user-types';

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public ID!: number;
  public username!: string;
  public password!: string;
  public uploadPerm!: boolean;
  public downloadPerm!: boolean;
  public searchPerm!: boolean;
  public adminPerm!: boolean;
  public userGroup!: string;
  public tokenUses!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init({
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: new DataTypes.STRING(128),
    allowNull: false,
    unique: true
  },
  password: {
    type: new DataTypes.STRING(128),
    allowNull: false
  },
  uploadPerm: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  downloadPerm: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  searchPerm: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  adminPerm: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  userGroup: {
    type: new DataTypes.STRING(128),
    allowNull: false
  },
  tokenUses: {
    type: DataTypes.INTEGER,
    defaultValue: 0, // originally set to 0 but the 1000 in verify token didn't work which blocks searching, delete this if needed
    allowNull: false
  }
}, {
  tableName: 'users',
  sequelize,
  timestamps: true
});
