import { IsNotEmpty, IsEnum } from 'class-validator';
import { FolderName } from './presigned-url.dto';

export class UploadFileDto {
  @IsNotEmpty()
  @IsEnum(FolderName, { message: 'Invalid image type' })
  type: FolderName; // Nhóm ảnh: 'ticket', 'coupon'...
}

export class MoveFileDto {
  @IsNotEmpty()
  tempPath: string;
}
