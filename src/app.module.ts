import { Module } from '@nestjs/common';
import { FileUploadModule } from './features/file-upload/file-upload.module';
import { MinioClientModule } from './features/minio-client/minio-client.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerMobile } from './entity/customer-mobile.entity';
import { CustomerMobileModule } from './features/customerMobile/customer-mobile.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerMobile]), FileUploadModule, MinioClientModule, DatabaseModule, CustomerMobileModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
