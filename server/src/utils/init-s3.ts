import 'dotenv/config';
import { CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_BUCKET_NAME } from '../config/s3.config.js';

async function initS3() {
  console.log(`Checking if bucket "${S3_BUCKET_NAME}" exists...`);
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: S3_BUCKET_NAME }));
    console.log(`Bucket "${S3_BUCKET_NAME}" already exists.`);
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      console.log(`Bucket "${S3_BUCKET_NAME}" not found. Creating...`);
      await s3Client.send(new CreateBucketCommand({ Bucket: S3_BUCKET_NAME }));
      console.log(`Bucket "${S3_BUCKET_NAME}" created successfully.`);
    } else {
      console.error('Error checking bucket:', error);
      process.exit(1);
    }
  }
}

initS3()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
