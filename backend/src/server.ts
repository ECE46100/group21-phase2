import sequelize from "./db";
import { Package } from "./models/package";
import { Version } from "./models/version";
import UserService from "./services/userService";
import router from "./app";
import express from "express";

const app = express();
// app.use(express.json());
app.use(express.json({ limit: "100mb" })); // otherwise we get 413 payload too large
app.use(router);

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

sequelize.sync({ force: true })
  .then(async () => {
    const defaultCreated = await UserService.createUser({
      username: "ece30861defaultadminuser",
      password: "correcthorsebatterystaple123(!__+@**(A'\\\"`;DROP TABLE packages;", //we need to escape \ itself
      adminPerm: true,
      searchPerm: true,
      downloadPerm: true,
      uploadPerm: true,
      userGroup: "admin",
    });
    if (defaultCreated) {
      console.log("Default user created");
    }
    await Package.create({
      name: "React",
      contentUpload: true,
    });
    await Package.create({
      name: "Lodash",
      contentUpload: true,
    });
    await Package.create({
      name: "UnderScore",
      contentUpload: true,
    });
    await Version.create({
      packageID: 1,
      version: "1.2.3",
      packageUrl: "https://reactjs.org/",
      author: "Facebook",
      accessLevel: "public",
      programPath: "none",
    });
    await Version.create({
      ID: 100,
      packageID: 1,
      version: "1.2.5",
      packageUrl: "check if create with a specific versionID is possible(needed in update).",
      author: "CLS",
      accessLevel: "public",
      programPath: "none",
    });
    await Version.create({
      packageID: 2,
      version: "17.0.2",
      packageUrl: "https://lodash.org/",
      author: "Facebook",
      accessLevel: "public",
      programPath: "none",
    });
    await Version.create({
      packageID: 3,
      version: "1.2.3",
      packageUrl: "https://underscore.org/",
      author: "Facebook",
      accessLevel: "public",
      programPath: "none",
    });
    await Version.create({
      packageID: 1,
      version: "1.2.4",
      packageUrl: "https://reactjs.org/",
      author: "Facebook",
      accessLevel: "public",
      programPath: "none",
    });
});

