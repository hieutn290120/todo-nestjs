import { IsNotEmpty, IsEnum } from 'class-validator';
import { FolderName } from './presigned-url.dto';
import { FileType } from 'src/features/minio-client/file.model';
export class UploadFileDto {
  @IsNotEmpty()
  @IsEnum(FolderName, { message: 'Invalid folder name' })
  readonly folderName: FolderName;

  @IsNotEmpty()
  @IsEnum(FileType, { message: 'Invalid file type' })
  readonly fileType: FileType;
}

export class MoveFileDto {
  @IsNotEmpty()
  readonly tempPath: string;

  @IsNotEmpty()
  @IsEnum(FileType, { message: 'Invalid file type' })
  readonly fileType: FileType;
}
