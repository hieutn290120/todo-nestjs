import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerMobile } from '../../entity/customer-mobile.entity';
import { CustomerMobileService } from './customer-mobile.service';
import { CustomerMobileController } from './customer-mobile.controller';
import { CustomerMobileRepository } from './customer-mobile.repository';
import { ContractContextService } from './contract-context.service';
import { ContractContextMiddleware } from './contract-context.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerMobile])],
  providers: [
    CustomerMobileService,
    ContractContextService,
    {
      provide: CustomerMobileRepository,
      useClass: CustomerMobileRepository,
    }
  ],
  controllers: [CustomerMobileController],
  exports: [CustomerMobileService],
})
export class CustomerMobileModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ContractContextMiddleware)
      .forRoutes('customer-mobile');
  }
} 