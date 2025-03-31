import { Injectable } from '@nestjs/common';
import { MinioClientService } from '../minio-client/minio-client.service';
import {
  BufferedFile,
  FileType,
  FileUploadResponse,
} from '../minio-client/file.model';
import { FolderName } from 'src/dto/upload-file';
import { BucketName } from '../minio-client/config';
@Injectable()
export class FileUploadService {
  constructor(private readonly minioClientService: MinioClientService) {}

  async uploadSingle(
    file: BufferedFile,
    folderName: FolderName,
    fileType: FileType,
  ): Promise<{ file: FileUploadResponse; message: string }> {
    const uploadedFile = await this.minioClientService.upload(
      file,
      fileType,
      folderName,
    );

    return {
      file: uploadedFile,
      message: `Successfully uploaded ${fileType} file to MinIO S3`,
    };
  }

  async uploadMany(
    files: BufferedFile[],
    folderName: FolderName,
    fileType: FileType,
  ): Promise<{ files: FileUploadResponse[]; message: string }> {
    const uploadPromises = files.map(
      async (file) =>
        await this.minioClientService.upload(file, fileType, folderName),
    );

    const uploadedFiles = await Promise.all(uploadPromises);

    return {
      files: uploadedFiles,
      message: `Successfully uploaded ${files.length} ${fileType} files to MinIO S3`,
    };
  }

  async moveFile(tempPath: string, baseBucket: string = BucketName.AdminSite) {
    return await this.minioClientService.moveFile(tempPath, baseBucket);
  }

  async getPresignedViewUrl(
    objectName: string,
    expiry: number,
    baseBucket: string = BucketName.AdminSite,
  ) {
    return await this.minioClientService.getPresignedViewUrl(
      objectName,
      expiry,
      baseBucket,
    );
  }

  async getPresignedUploadUrl(
    folderName: string,
    extFile: string,
    fileType: FileType,
    expiry: number,
    baseBucket: string,
  ) {
    return await this.minioClientService.getPresignedUploadUrl(
      folderName,
      extFile,
      fileType,
      expiry,
      baseBucket,
    );
  }
}
