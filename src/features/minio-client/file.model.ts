export enum FileType {
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
}

export enum ImageMimeType {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  GIF = 'image/gif',
  WEBP = 'image/webp',
}

export enum VideoMimeType {
  MP4 = 'video/mp4',
  QUICKTIME = 'video/quicktime',
  X_MSVIDEO = 'video/x-msvideo',
}

export enum AudioMimeType {
  MPEG = 'audio/mpeg',
  WAV = 'audio/wav',
  OGG = 'audio/ogg',
}

export type AppMimeType = ImageMimeType | VideoMimeType | AudioMimeType;

export interface BufferedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: AppMimeType;
  size: number;
  buffer: Buffer;
}

export interface StoredFile extends HasFile, StoredFileMetadata {}

export interface HasFile {
  file: Buffer;
}

export interface StoredFileMetadata {
  id: string;
  name: string;
  encoding: string;
  mimetype: AppMimeType;
  size: number;
  updatedAt: Date;
  fileSrc?: string;
  fileType: FileType;
}

export interface FileUploadResponse {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: AppMimeType;
  path: string;
  fileType: FileType;
}
