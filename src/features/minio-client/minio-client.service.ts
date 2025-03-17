import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import { BufferedFile } from './file.model';
import * as crypto from 'crypto';
import { config } from 'src/config/config';
import { ImageType } from 'src/dto/upload-file/upload-file.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MinioClientService {
  private readonly logger: Logger;
  private readonly baseBucket = 'admin-site';
  private readonly folderBase = 'system';
  private readonly folderTemp = 'temp-uploads';

  constructor(private readonly minioService: MinioService) {}

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
    const fileName: string = `${this.folderTemp}/${ImageType[folderBase]}/${filename}`;
    const fileBuffer = file.buffer;
    try {
      await this.minioService.client.putObject(
        baseBucket,
        fileName,
        fileBuffer,
      );
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
    const copyConditions = this.minioService.copyConditions;

    await this.minioService.client.copyObject(
      baseBucket,
      finalFilePath,
      tempPath,
      copyConditions,
    );

    await this.minioService.client.removeObject(baseBucket, tempPath);
    console.log(`Moved ${finalFilePath} to permanent storage`);

    return {
      url: finalFilePath,
    };
  }

  async delete(objectName: string, baseBucket: string = this.baseBucket) {
    const res = await this.minioService.client.removeObject(
      baseBucket,
      objectName,
    );
    console.log(res);
  }
}
