import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';

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

export interface UserCreationAttributes extends Omit<UserAttributes, 'ID' | 'tokenUses'> {}

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
    defaultValue: 0,
    allowNull: false
  }
}, {
  tableName: 'users',
  sequelize,
  timestamps: true
});
