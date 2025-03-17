import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Body,
  Get,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { BufferedFile } from '../minio-client/file.model';
import { FileUploadService } from './file-upload.service';
import {
  MoveFileDto,
  UploadFileDto,
} from 'src/dto/upload-file/upload-file.dto';

@Controller('file-upload')
export class FileUploadController {
  constructor(private fileUploadService: FileUploadService) {}

  @Post('single')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB mỗi file
      fileFilter: (req, file, cb) => {
        // Kiểm tra loại file hợp lệ
        if (!file.mimetype.match(/(jpg|jpeg|png|gif)$/i)) {
          return cb(new BadRequestException('Chỉ chấp nhận file ảnh!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadSingleFile(
    @UploadedFile() file: BufferedFile,
    @Body() data: UploadFileDto,
  ) {
    return await this.fileUploadService.uploadSingle(file, data.type);
  }

  @Post('multiple')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB mỗi file
      fileFilter: (req, file, cb) => {
        // Kiểm tra loại file hợp lệ
        if (!file.mimetype.match(/(jpg|jpeg|png|gif)$/i)) {
          return cb(new BadRequestException('Chỉ chấp nhận file ảnh!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadMultipleFiles(
    @UploadedFiles() files: BufferedFile[],
    @Body() data: UploadFileDto,
  ) {
    return this.fileUploadService.uploadMany(files, data.type);
  }
}
