import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  Body,
  Get,
  Query,
  HttpStatus,
  HttpException,
  UseInterceptors,
} from '@nestjs/common';
import { BufferedFile } from '../minio-client/file.model';
import { FileUploadService } from './file-upload.service';
import { UploadFileDto } from 'src/dto/upload-file/upload-file.dto';
import {
  PresignedUrlQueryDto,
  PresignedViewQueryDto,
} from 'src/dto/upload-file/presigned-url.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { BucketName } from '../minio-client/config';
@Controller('file-upload')
export class FileUploadController {
  private readonly expiry: number = 60 * 10; // 10 minutes

  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingleFile(
    @UploadedFile() file: BufferedFile,
    @Body() data: UploadFileDto,
  ) {
    try {
      if (!file) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      return await this.fileUploadService.uploadSingle(
        file,
        data.folderName,
        data.fileType,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error uploading single file:', error);
      throw new HttpException(
        'Failed to upload file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultipleFiles(
    @UploadedFiles() files: BufferedFile[],
    @Body() data: UploadFileDto,
  ) {
    try {
      if (!files || files.length === 0) {
        throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
      }

      if (files.length > 5) {
        throw new HttpException(
          'Maximum 5 files allowed',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.fileUploadService.uploadMany(
        files,
        data.folderName,
        data.fileType,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error uploading multiple files:', error);
      throw new HttpException(
        'Failed to upload files',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('presigned-upload')
  async getPresignedUpload(@Query() query: PresignedUrlQueryDto) {
    try {
      const {
        folderName,
        extFile,
        fileType,
        bucketName = BucketName.AdminSite,
      } = query;

      const url = await this.fileUploadService.getPresignedUploadUrl(
        folderName,
        extFile,
        fileType,
        this.expiry,
        bucketName,
      );

      return { url };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error generating presigned upload URL:', error);
      throw new HttpException(
        'Failed to generate presigned upload URL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('presigned-view')
  async getPresignedView(@Query() query: PresignedViewQueryDto) {
    try {
      const { folderName, bucketName = BucketName.AdminSite } = query;

      const url = await this.fileUploadService.getPresignedViewUrl(
        folderName,
        this.expiry,
        bucketName,
      );

      return { url };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error generating presigned view URL:', error);
      throw new HttpException(
        'Failed to generate presigned view URL',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // @Get('move-file')
  // async moveAnDeleteFileTmp(@Query() query: any) {
  //   const { tempPath, bucketName = BucketName.AdminSite } = query;
  //   return await this.fileUploadService.moveFile(tempPath, bucketName);
  // }
}
