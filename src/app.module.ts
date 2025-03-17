import { Module } from '@nestjs/common';
import { FileUploadModule } from './features/file-upload/file-upload.module';
import { MinioClientModule } from './features/minio-client/minio-client.module';

@Module({
  imports: [FileUploadModule, MinioClientModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
