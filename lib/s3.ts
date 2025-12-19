import { S3Client } from "@aws-sdk/client-s3";

const S3 = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL_S3 as string,
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export default S3;
