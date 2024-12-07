import sequelize from "./db";
import router from "./app";
import express from "express";
import resetBucket from "./utils/resetUtil";
import UserService from "./services/userService";
// import PackageService from "./services/packageService";
import { requestLogger } from "./utils/logUtils";
import PackageService from "./services/packageService";

const app = express();

app.use(requestLogger);
app.use(express.json({ limit: "100mb" })); // otherwise we get 413 payload too large
app.use(router);

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

sequelize.sync({ force: true }).then(async () => {
  await resetBucket();
  await UserService.createUser({
    username: 'ece30861defaultadminuser',
    password: "correcthorsebatterystaple123(!__+@**(A'\"`;DROP TABLE packages;",
    adminPerm: true,
    searchPerm: true,
    downloadPerm: true,
    uploadPerm: true,
    userGroup: 'admin',
  });

  await UserService.createUserGroup('admin', 'default user group');
  // await PackageService.createPackage({
  //   name: "React",
  //   contentUpload: true,
  // });
  // await PackageService.createVersion({
  //   packageID: 1,
  //   version: "1.2.3",
  //   packageUrl: "https://reactjs.org/",
  //   author: "Facebook",
  //   accessLevel: "public",
  //   JSProgram: '',
  // });

  console.log('Database and tables created!');
}).catch((err) => {
  console.log(err);
});
