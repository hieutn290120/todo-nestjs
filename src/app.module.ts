import { Module } from '@nestjs/common';
import { FileUploadModule } from './features/file-upload/file-upload.module';

@Module({
  imports: [FileUploadModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
