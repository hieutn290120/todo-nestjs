import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BufferedFile } from './file.model';
import * as crypto from 'crypto';
import { config } from 'src/config/config';
import { v4 as uuidv4 } from 'uuid';
import * as Minio from 'minio';
import { FolderName } from 'src/dto/upload-file';

@Injectable()
export class MinioClientService {
  private readonly baseBucket = 'admin-site';
  private readonly folderBase = 'system';
  private readonly folderTemp = 'temp-uploads';
  private readonly expiry = 60 * 10;
  private readonly minioClient: Minio.Client;

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: 'localhost',
      port: 9000,
      useSSL: false,
      accessKey: 'minio',
      secretKey: 'minio123',
    });
  }

  async upload(
    file: BufferedFile,
    folderBase: string = this.folderBase,
    baseBucket: string = this.baseBucket,
  ) {
    if (!(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))) {
      throw new HttpException('Error uploading file', HttpStatus.BAD_REQUEST);
    }
    const temp_filename = Date.now().toString();
    const hashedFileName = crypto
      .createHash('md5')
      .update(temp_filename)
      .digest('hex');
    const ext = file.originalname.substring(
      file.originalname.lastIndexOf('.'),
      file.originalname.length,
    );

    const filename = uuidv4() + hashedFileName + ext;
    const fileName: string = `${this.folderTemp}/${FolderName[folderBase]}/${filename}`;
    const fileBuffer = file.buffer;
    try {
      await this.minioClient.putObject(baseBucket, fileName, fileBuffer);
    } catch (error) {
      console.log(error);
      throw new HttpException('Error uploading file', HttpStatus.BAD_REQUEST);
    }

    return {
      url: `${config.MINIO_BUCKET}/${fileName}`,
    };
  }

  async moveFile(tempPath: string, baseBucket: string = this.baseBucket) {
    const finalFilePath = tempPath.replace(`${this.folderTemp}/`, '');

    // Tạo một điều kiện sao chép (có thể để trống)
    const copyConditions = new Minio.CopyConditions();

    await this.minioClient.copyObject(
      baseBucket,
      finalFilePath,
      tempPath,
      copyConditions,
    );

    await this.minioClient.removeObject(baseBucket, tempPath);
    console.log(`Moved ${finalFilePath} to permanent storage`);

    return {
      url: finalFilePath,
    };
  }

  async delete(objectName: string, baseBucket: string = this.baseBucket) {
    await this.minioClient.removeObject(baseBucket, objectName);
  }

  async getPresignedViewUrl(objectName: string, expiry: number = this.expiry) {
    return await this.minioClient.presignedGetObject(
      this.baseBucket,
      objectName,
      expiry,
    );
  }

  async getPresignedUploadUrl(
    folderName: string,
    extFile: string,
    expiry: number = this.expiry,
  ) {
    const fileName: string = `${FolderName[folderName]}/${uuidv4()}.${extFile}`;

    return await this.minioClient.presignedPutObject(
      this.baseBucket,
      fileName,
      expiry,
    );
  }
}
