import { IsNotEmpty, IsEnum } from 'class-validator';

export enum ImageType {
  ticket = 'ticket',
  coupon = 'coupon',
  stamp = 'stamp',
  system = 'system',
  banner = 'banner',
}

export class UploadFileDto {
  @IsNotEmpty()
  @IsEnum(ImageType, { message: 'Invalid image type' })
  type: ImageType; // Nhóm ảnh: 'ticket', 'coupon'...
}

export class MoveFileDto {
  @IsNotEmpty()
  tempPath: string;
}
