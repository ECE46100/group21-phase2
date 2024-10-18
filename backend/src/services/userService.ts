import { User } from "../models/user";
import * as auth from "../utils/authUtils";
import type { UserAttributes, UserCreationAttributes } from "../models/user";

class UserService {
  public async createUser(user: UserCreationAttributes): Promise<undefined> {
    const hashedPassword = await auth.hashPassword(user.password);
    user.password = hashedPassword;
    await User.create(user);
    return;
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
    User.update({ tokenUses: 1000 }, { where: { username: username } });
    return await auth.generateToken(username);
  }

  public async verifyToken(token: string): Promise<boolean> {
    try {
      const username = await auth.verifyToken(token);
      const user = await this.getUser(username);
      if (user) {
        User.update({ tokenUses: user.tokenUses - 1 }, { where: { username: username } });
        return user.tokenUses > 0;
      }
    }
    catch (err) {
      return false;
    }
    return false;
  }
}

export default new UserService();