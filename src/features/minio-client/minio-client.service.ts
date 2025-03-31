import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { BufferedFile, FileType, FileUploadResponse } from './file.model';
import { v4 as uuidv4 } from 'uuid';
import * as Minio from 'minio';
import { FileExtension, FolderName } from 'src/dto/upload-file';
import { config, directory, BucketName } from './config';

interface MinioError extends Error {
  code?: string;
}

interface FileTypeConfig {
  allowedMimeTypes: string[];
  maxFileSize: number;
}

@Injectable()
export class MinioClientService implements OnModuleInit {
  private readonly baseBucket: string;
  private readonly folderBase: string;
  private readonly folderTemp: string;
  private readonly minioClient: Minio.Client;
  private readonly fileTypeConfigs: Record<FileType, FileTypeConfig>;

  constructor() {
    this.baseBucket = BucketName.AdminSite || 'admin-site';
    this.folderBase = directory.system || 'syst em';
    this.folderTemp = directory.temp || 'temp';

    this.fileTypeConfigs = {
      image: {
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
        ],
        maxFileSize: 5 * 1024 * 1024, // 5MB
      },
      video: {
        allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
        maxFileSize: 100 * 1024 * 1024, // 100MB
      },
      audio: {
        allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
        maxFileSize: 20 * 1024 * 1024, // 20MB
      },
    };

    this.minioClient = new Minio.Client({
      endPoint: config.MINIO_ENDPOINT || 'localhost',
      port: config.MINIO_PORT || 9000,
      useSSL: false,
      accessKey: config.MINIO_ACCESSKEY || 'minio',
      secretKey: config.MINIO_SECRETKEY || 'minio123',
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.minioClient.bucketExists(this.baseBucket);
      if (!exists) {
        await this.minioClient.makeBucket(this.baseBucket);
        console.log(`Created bucket: ${this.baseBucket}`);
      }
    } catch (error) {
      console.error('Failed to initialize MinIO bucket:', error);
      throw new HttpException(
        'Failed to initialize storage service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private validationFileType(extFile: FileExtension, fileType: FileType): void {
    const config = this.fileTypeConfigs[fileType];
    if (!config.allowedMimeTypes.includes(`${fileType}/${extFile}`)) {
      throw new HttpException(
        `Invalid file type. Allowed types for ${fileType}: ${config.allowedMimeTypes.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private validateFile(file: BufferedFile, fileType: FileType): void {
    if (!file || !file.buffer || !file.mimetype) {
      throw new HttpException('Invalid file data', HttpStatus.BAD_REQUEST);
    }

    const config = this.fileTypeConfigs[fileType];
    this.validationFileType(
      file.mimetype.split('/')[1] as FileExtension,
      fileType,
    );

    if (file.buffer.length > config.maxFileSize) {
      throw new HttpException(
        `File size exceeds ${config.maxFileSize / (1024 * 1024)}MB limit for ${fileType}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!file.originalname || file.originalname.length > 255) {
      throw new HttpException('Invalid filename', HttpStatus.BAD_REQUEST);
    }
  }

  private throwError(error: MinioError): void {
    console.error('Error uploading file:', error);

    if (error instanceof HttpException) {
      throw error;
    }
    const minioError = error;

    if (minioError.code === 'NoSuchBucket') {
      throw new HttpException(
        'Storage bucket not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (minioError.code === 'InvalidAccessKeyId') {
      throw new HttpException(
        'Invalid storage credentials',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    throw new HttpException(
      'Failed to upload file',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async upload(
    file: BufferedFile,
    fileType: FileType,
    folderBase: string = this.folderBase,
    baseBucket: string = this.baseBucket,
  ): Promise<FileUploadResponse> {
    try {
      this.validateFile(file, fileType);

      const ext = '.' + file.mimetype.split('/')[1];
      const filename = uuidv4() + ext;
      const filePath = `${this.folderTemp}/${FolderName[folderBase]}/${filename}`;

      const metaData = {
        'Content-Type': file.mimetype,
        'X-Amz-Meta-Original-Filename': file.originalname,
        'X-Amz-Meta-Upload-Date': new Date().toISOString(),
        'X-Amz-Meta-File-Type': fileType,
      };

      await this.minioClient.putObject(
        baseBucket,
        filePath,
        file.buffer,
        file.buffer.length,
        metaData,
      );

      return {
        url: `${baseBucket}/${filePath}`,
        filename: filename,
        originalName: file.originalname,
        size: file.buffer.length,
        mimeType: file.mimetype,
        path: filePath,
        fileType: fileType,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      if (error instanceof HttpException) {
        throw error;
      }

      const minioError = error as MinioError;
      if (minioError.code === 'NoSuchBucket') {
        throw new HttpException(
          'Storage bucket not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      if (minioError.code === 'InvalidAccessKeyId') {
        throw new HttpException(
          'Invalid storage credentials',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'Failed to upload file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async moveFile(tempPath: string, baseBucket: string = this.baseBucket) {
    try {
      if (!tempPath) {
        throw new HttpException('Invalid file path', HttpStatus.BAD_REQUEST);
      }

      const finalFilePath = tempPath.replace(
        `${baseBucket}/${this.folderTemp}/`,
        '',
      );
      const copyConditions = new Minio.CopyConditions();

      // Check if source file exists
      try {
        await this.minioClient.statObject(
          baseBucket,
          tempPath.replace(`${baseBucket}/`, ''),
        );
      } catch (error) {
        const minioError = error as MinioError;
        if (minioError.code === 'NotFound') {
          throw new HttpException(
            'Source file not found',
            HttpStatus.NOT_FOUND,
          );
        }
        throw error;
      }

      await this.minioClient.copyObject(
        baseBucket,
        finalFilePath,
        tempPath,
        copyConditions,
      );

      await this.minioClient.removeObject(
        baseBucket,
        tempPath.replace(`${baseBucket}/`, ''),
      );
      console.log(`Moved ${finalFilePath} to permanent storage`);

      return {
        url: `${baseBucket}/${finalFilePath}`,
        message: 'File moved to permanent storage',
      };
    } catch (error) {
      console.error('Error moving file:', error);
      this.throwError(error);
    }
  }

  async delete(
    objectName: string,
    fileType: FileType,
    baseBucket: string = this.baseBucket,
  ) {
    try {
      if (!objectName) {
        throw new HttpException('Invalid object name', HttpStatus.BAD_REQUEST);
      }

      // Check if object exists before deleting
      try {
        await this.minioClient.statObject(baseBucket, objectName);
      } catch (error) {
        const minioError = error as MinioError;
        if (minioError.code === 'NotFound') {
          throw new HttpException('File not found', HttpStatus.NOT_FOUND);
        }
        throw error;
      }

      await this.minioClient.removeObject(baseBucket, objectName);
      return { fileType };
    } catch (error) {
      console.error('Error deleting file:', error);
      this.throwError(error);
    }
  }

  async getPresignedViewUrl(
    folderPath: string,
    expiry: number,
    baseBucket: string = this.baseBucket,
  ) {
    try {
      if (!folderPath) {
        throw new HttpException('Invalid object name', HttpStatus.BAD_REQUEST);
      }

      // Check if object exists
      try {
        await this.minioClient.statObject(
          baseBucket,
          folderPath.replace(`${baseBucket}/`, ''),
        );
      } catch (error) {
        const minioError = error as MinioError;
        if (minioError.code === 'NotFound') {
          throw new HttpException('File not found', HttpStatus.NOT_FOUND);
        }
        throw error;
      }

      return await this.minioClient.presignedGetObject(
        baseBucket,
        folderPath,
        expiry,
      );
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      this.throwError(error);
    }
  }

  async getPresignedUploadUrl(
    folderName: string,
    extFile: string,
    fileType: FileType,
    expiry: number,
    baseBucket: string = this.baseBucket,
  ) {
    try {
      this.validationFileType(extFile as FileExtension, fileType);

      const fileName: string = `${FolderName[folderName]}/${uuidv4()}.${extFile}`;

      return await this.minioClient.presignedPutObject(
        baseBucket,
        fileName,
        expiry,
      );
    } catch (error) {
      console.error('Error generating presigned upload URL:', error);
      this.throwError(error);
    }
  }
}
