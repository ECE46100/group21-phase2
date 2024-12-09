/**
 * @fileoverview This file contains the S3 client configuration.
 */
import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

let { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, CI_ON } = process.env;

if (CI_ON) {
  AWS_ACCESS_KEY_ID = "";
  AWS_SECRET_ACCESS_KEY = "";
  AWS_REGION = "us-east-1";
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

export default s3Client;








