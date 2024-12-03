import { Request, Response } from 'express';
import { Version } from '../models/version';
import { Package } from '../models/package';
import { User } from '../models/user';
import UserService from '../services/userService';
import s3Client from '../S3';
import { paginateListObjectsV2 } from '@aws-sdk/client-s3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export default async function reset(req: Request, res: Response) {
  await Version.destroy({ where: {} });
  await Package.destroy({ where: {} });
  await User.destroy({ where: {} });

  const paginator = paginateListObjectsV2(
    { client: s3Client },
    { Bucket: 'packages-group21' },
  );
  for await (const page of paginator) {
    const objects = page.Contents;
    if (objects) {
      for (const object of objects) {
        await s3Client.send(
          new DeleteObjectCommand({ Bucket: 'packages-group21', Key: object.Key }),
        );
      }
    }
  }

  await UserService.createUser({
    username: 'ece30861defaultadminuser',
    password: 'correcthorsebatterystaple123(!__+@**(A\'\\"`;DROP TABLE packages;',
    adminPerm: true,
    searchPerm: true,
    downloadPerm: true,
    uploadPerm: true,
    userGroup: 'admin',
  });

  res.status(200).send('Database and S3 bucket cleared');
}
