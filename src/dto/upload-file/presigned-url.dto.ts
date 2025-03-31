import { IsNotEmpty, IsEnum, IsString, IsOptional } from 'class-validator';
import { FileType } from 'src/features/minio-client/file.model';
import { BucketName } from 'src/features/minio-client/config';

export enum FolderName {
  ticket = 'ticket',
  coupon = 'coupon',
  stamp = 'stamp',
  system = 'system',
  banner = 'banner',
  video = 'video',
  audio = 'audio',
}

export enum FileExtension {
  // Image extensions
  JPEG = 'jpeg',
  JPG = 'jpg',
  PNG = 'png',
  GIF = 'gif',
  WEBP = 'webp',
  // Video extensions
  MP4 = 'mp4',
  MOV = 'mov',
  AVI = 'avi',
  // Audio extensions
  MP3 = 'mp3',
  WAV = 'wav',
  OGG = 'ogg',
}

export class PresignedUrlQueryDto {
  @IsNotEmpty()
  @IsEnum(FolderName, { message: 'Invalid folder type' })
  readonly folderName: FolderName;

  @IsNotEmpty()
  @IsEnum(FileExtension, { message: 'Invalid file extension' })
  readonly extFile: FileExtension;

  @IsNotEmpty()
  @IsEnum(FileType, { message: 'Invalid file type' })
  readonly fileType: FileType;

  @IsOptional()
  @IsEnum(BucketName, { message: 'Invalid bucket name' })
  readonly bucketName?: BucketName;
}

export class PresignedViewQueryDto {
  @IsNotEmpty()
  @IsString()
  readonly folderName: string;

  @IsOptional()
  @IsEnum(BucketName, { message: 'Invalid bucket name' })
  readonly bucketName?: BucketName;
}
