import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageService, FileStorageOptions } from './storage.interface';

export class S3StorageService implements IStorageService {
  private clientInstance: S3Client | null = null;

  private get client(): S3Client {
    if (!this.clientInstance) {
      this.clientInstance = new S3Client({
        region: process.env.S3_REGION || 'us-east-1',
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || 'dummy_key',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'dummy_secret',
        },
        forcePathStyle: true,
      });
    }
    return this.clientInstance;
  }

  private get bucketName(): string {
    return process.env.S3_BUCKET || 'default-bucket';
  }

  async uploadFile(buffer: Buffer, storageKey: string, options: FileStorageOptions): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: storageKey,
      Body: buffer,
      ContentType: options.mimeType,
      ACL: 'private',
    });

    await this.client.send(command);
    return storageKey;
  }

  async getFileUrl(storageKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: storageKey,
    });

    // Generate a pre-signed URL that expires in 1 hour (3600 seconds)
    const url = await getSignedUrl(this.client, command, { expiresIn: 3600 });
    return url;
  }

  async deleteFile(storageKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: storageKey,
    });

    await this.client.send(command);
  }
}

// Export a singleton instance
export const storageService = new S3StorageService();
