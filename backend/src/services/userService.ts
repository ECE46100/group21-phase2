import { User } from "../models/user";
import * as auth from "../utils/authUtils";
import type { UserAttributes, UserCreationAttributes } from "../models/user";

interface UserPerms {
  uploadPerm: boolean;
  downloadPerm: boolean;
  searchPerm: boolean;
  adminPerm: boolean;
}

class UserService {
  public async createUser(user: UserCreationAttributes): Promise<boolean> {
    /* TODO: Check for "strong" password */
    const hashedPassword = await auth.hashPassword(user.password);
    user.password = hashedPassword;
    try {
      await User.create(user);
      return true;
    } catch (err) {
      return false;
    }
  }

  public async deleteUser(username: string): Promise<boolean> {
    const user = await this.getUser(username);
    if (user) {
      await User.destroy({ where: { ID: user.ID } });
      return true;
    }
    return false;
  }

  public async getUser(username: string): Promise<UserAttributes | null> {
    return await User.findOne({ where: { username: username } });
  }

  public async verifyUser(username: string, password: string): Promise<boolean> {
    const user = await this.getUser(username);
    if (user) {
      return await auth.comparePassword(password, user.password);
    }
    return false;
  }

  public async generateToken(username: string): Promise<string | Error> {
    const user = await this.getUser(username);
    if (!user) {
      return new Error("User not found");
    }
    await User.update({ tokenUses: 1000 }, { where: { ID: user.ID } });
    return await auth.generateToken(username);
  }

  public async verifyToken(token: string): Promise<boolean> {
    try {
      const username = await auth.verifyToken(token);
      const user = await this.getUser(username);
      if (user) {
        if (user.tokenUses > 0) {
          await User.update({ tokenUses: user.tokenUses - 1 }, { where: { ID: user.ID } }); // TODO: Potential Race Condition
          return true;
        } else {
          return false;
        }
      }
    }
    catch (err) {
      return false;
    }
    return false;
  }

  public async getUserGroup(username: string): Promise<string | null> {
    const user = await this.getUser(username);
    if (user) {
      return user.userGroup;
    }
    return null;
  }

  public async getUserPerms(username: string): Promise<UserPerms | null> {
    const user = await this.getUser(username);
    if (user) {
      return {
        uploadPerm: user.uploadPerm,
        downloadPerm: user.downloadPerm,
        searchPerm: user.searchPerm,
        adminPerm: user.adminPerm
      };
    }
    return null;
  }
}

export default new UserService();