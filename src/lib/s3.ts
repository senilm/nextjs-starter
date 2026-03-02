/**
 * @file s3.ts
 * @module lib/s3
 * AWS S3 client with presigned URL helpers for file uploads and downloads.
 */

import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { env } from '@/lib/env'

const PRESIGNED_URL_EXPIRES_IN = 3600

export const s3 = new S3Client({
  region: env.AWS_S3_REGION ?? 'us-east-1',
  credentials:
    env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
})

export const getPresignedUploadUrl = async (
  key: string,
  contentType: string,
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
    ContentType: contentType,
  })

  return getSignedUrl(s3, command, { expiresIn: PRESIGNED_URL_EXPIRES_IN })
}

export const getPresignedDownloadUrl = async (key: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
  })

  return getSignedUrl(s3, command, { expiresIn: PRESIGNED_URL_EXPIRES_IN })
}
