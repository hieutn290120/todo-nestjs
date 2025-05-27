import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CustomerMobileService } from './customer-mobile.service';
import { CustomerMobile } from '../../entity/customer-mobile.entity';

@Controller('customer-mobile')
export class CustomerMobileController {
  constructor(private readonly customerMobileService: CustomerMobileService) {}

  @Get()
  async findAll(): Promise<CustomerMobile[]> {
    console.log(1312321);
    return this.customerMobileService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<CustomerMobile | null> {
    return this.customerMobileService.findOne(id);
  }
} 