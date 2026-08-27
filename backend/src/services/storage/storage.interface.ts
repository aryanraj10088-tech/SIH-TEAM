export interface FileStorageOptions {
  mimeType: string;
}

export interface IStorageService {
  /**
   * Uploads a file buffer to storage and returns the generated storage key.
   */
  uploadFile(buffer: Buffer, storageKey: string, options: FileStorageOptions): Promise<string>;

  /**
   * Generates a pre-signed URL or authenticated URL for downloading a file.
   * If the storage is private, this must be a short-lived URL.
   */
  getFileUrl(storageKey: string): Promise<string>;

  /**
   * Deletes a file from storage.
   */
  deleteFile(storageKey: string): Promise<void>;
}
