import { Request, Response } from 'express';
import { Version } from '../models/version';
import { Package } from '../models/package';
import { User } from '../models/user';
import UserService from '../services/userService';
import resetBucket from '../utils/resetUtil';

// export default async function reset(req: Request, res: Response) {
//   await Version.destroy({ where: {} });
//   await Package.destroy({ where: {} });
//   await User.destroy({ where: {} });

//   await resetBucket();

//   await UserService.createUser({
//     username: 'ece30861defaultadminuser',
//     password: "correcthorsebatterystaple123(!__+@**(A'\"`;DROP TABLE packages;",
//     adminPerm: true,
//     searchPerm: true,
//     downloadPerm: true,
//     uploadPerm: true,
//     userGroup: 'admin',
//   });

//   res.status(200).send('Database and S3 bucket cleared');
// }

export default async function reset(req: Request, res: Response) {
  try {
    // Perform all operations that need to be reset
    await Version.destroy({ where: {} });
    await Package.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Reset the S3 bucket
    await resetBucket();

    // Create a default admin user
    await UserService.createUser({
      username: 'ece30861defaultadminuser',
      password: "correcthorsebatterystaple123(!__+@**(A'\"`;DROP TABLE packages;",
      adminPerm: true,
      searchPerm: true,
      downloadPerm: true,
      uploadPerm: true,
      userGroup: 'admin',
    });

    // Send the success response
    res.status(200).send('Database and S3 bucket cleared');
  } catch (error) {
    console.error('Error during reset process:', error);

    // Handle the error properly
    res.status(500).send('Error resetting the database and S3 bucket');
  }
}
