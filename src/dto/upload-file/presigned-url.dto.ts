import { IsNotEmpty, IsEnum, IsString } from 'class-validator';

export enum FolderName {
  ticket = 'ticket',
  coupon = 'coupon',
  stamp = 'stamp',
  system = 'system',
  banner = 'banner',
}

export enum ExtFile {
  JPEG = 'jpeg',
  JPG = 'jpg',
  PNG = 'png',
  GIF = 'gif',
}

export class PresignedUrlQueryDto {
  @IsNotEmpty()
  @IsEnum(FolderName, { message: 'Invalid folder type' })
  readonly folderName: FolderName; // Nhóm ảnh: 'ticket', 'coupon'...

  @IsNotEmpty()
  @IsEnum(ExtFile, { message: 'Invalid ext file' })
  readonly extFile: ExtFile; // Nhận thêm Extention của file
}

export class PresignedViewQueryDto {
  @IsNotEmpty()
  @IsString()
  readonly folderName: string;
}
