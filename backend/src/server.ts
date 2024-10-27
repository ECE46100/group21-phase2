import sequelize from "./db";
import { User } from "./models/user";

sequelize.sync({ force: true })
  .then(async () => {
    const user = await User.create({
      username: 'georgenolan',
      password: 'some_password',
      uploadPerm: true,
      downloadPerm: true,
      searchPerm: true,
      adminPerm: true,
      userGroup: 'admin'
    });
});