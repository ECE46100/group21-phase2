import s3Client from '../S3';
import { paginateListObjectsV2 } from '@aws-sdk/client-s3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

/**
 * Reset the bucket by deleting all objects in the bucket.
 */
export default async function resetBucket() {
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
}