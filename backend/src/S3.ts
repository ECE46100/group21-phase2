import { S3Client, CreateBucketCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

let { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, CI_ON } = process.env;

if (CI_ON) {
  AWS_ACCESS_KEY_ID = "";
  AWS_SECRET_ACCESS_KEY = "";
  AWS_REGION = "";
} else if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION) {
  throw new Error("Missing AWS configuration");
}

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

s3Client.send(
  new CreateBucketCommand({ 
    Bucket: "packages-group21" 
  })
).then((data) => 
  console.log(data)
).catch((error) =>
  console.error(error)
);

export default s3Client;








