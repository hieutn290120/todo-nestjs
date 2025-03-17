import { Injectable } from '@nestjs/common';
import { MinioClientService } from '../minio-client/minio-client.service';
import { BufferedFile } from '../minio-client/file.model';

@Injectable()
export class FileUploadService {
  constructor(private minioClientService: MinioClientService) {}

  async uploadSingle(image: BufferedFile, folderBase: string) {
    const uploaded_image = await this.minioClientService.upload(
      image,
      folderBase,
    );

    return {
      image_url: uploaded_image.url,
      message: 'Successfully uploaded to MinIO S3',
    };
  }

  async uploadMany(files: BufferedFile[], folderBase: string) {
    const uploadPromises = files.map(
      async (file) => await this.minioClientService.upload(file, folderBase),
    );

    const uploadedImages = await Promise.all(uploadPromises);

    return {
      image_urls: uploadedImages.map((img) => img.url),
      message: 'Successfully uploaded mutiple image on MinioS3',
    };
  }

  async moveFile(tempPath: string) {
    await this.minioClientService.moveFile(tempPath);
  }
}
