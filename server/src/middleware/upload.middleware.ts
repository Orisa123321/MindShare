import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3Client, S3_BUCKET_NAME } from '../config/s3.config.js';
import path from 'path';
import { ValidationError } from '../types/index.js';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

// ============================================================================
// File Upload Middleware (AWS S3 / LocalStack)
// ============================================================================

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '200', 10);
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Allowed MIME types for study materials
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/markdown',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/zip',
  'application/x-rar-compressed',
];

// Configure S3 storage
const storage = multerS3({
  s3: s3Client,
  bucket: S3_BUCKET_NAME,
  // LocalStack testing doesn't need acl, but on AWS you might need it or rely on bucket policies
  metadata: function (_req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (_req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 100);
    cb(null, `uploads/${uniqueSuffix}-${baseName}${ext}`);
  },
});

// File filter function
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError(
      `File type "${file.mimetype}" is not allowed. Accepted types: PDF, Word, PowerPoint, Excel, text, images, and archives.`
    ));
  }
};

// Create the upload middleware instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1, // Single file upload
  },
});

export const uploadMaterial = upload.single('file');

/**
 * Helper to build the file URL from the stored S3 Key (filename).
 */
export function getFileUrl(fileInfo: any): string {
  // multer-s3 attaches the 'location' URL to the file object
  if (fileInfo.location) {
    return fileInfo.location;
  }
  // Fallback construction if needed
  return `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${fileInfo.key}`;
}

/**
 * Helper to delete a file from S3 storage.
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    // Extract the key from the URL (everything after the domain or bucket name)
    // For LocalStack, the URL might look like http://localhost:4566/bucketname/uploads/...
    // For AWS, it might look like https://bucketname.s3.amazonaws.com/uploads/...
    
    // Simple naive extraction (assuming 'uploads/' is part of the key)
    const match = fileUrl.match(/(uploads\/.*)$/);
    const key = match ? match[1] : null;

    if (key) {
      const command = new DeleteObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
      });
      await s3Client.send(command);
      console.log(`Deleted file from S3: ${key}`);
    }
  } catch (error) {
    console.error(`Failed to delete file from S3: ${fileUrl}`, error);
  }
}

export default upload;
