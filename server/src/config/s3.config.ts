import { S3Client } from '@aws-sdk/client-s3';

// ============================================================================
// AWS S3 Configuration
// ============================================================================
// Configures the AWS SDK S3 client.
// By default, it connects to AWS. If LocalStack is used (for local dev),
// it points to http://localhost:4566.
// ============================================================================

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  },
  // Use custom endpoint for both local (MinIO) and Backblaze B2 in production
  ...(process.env.AWS_ENDPOINT_URL ? { endpoint: process.env.AWS_ENDPOINT_URL } : {}),
  forcePathStyle: true, // Required for MinIO (local) and Backblaze B2 (production)
});

export const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'studyshare-uploads';
