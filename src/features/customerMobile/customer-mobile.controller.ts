import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CustomerMobileService } from './customer-mobile.service';
import { CustomerMobile } from '../../entity/customer-mobile.entity';
import { ContractContextService } from './contract-context.service';

@Controller('customer-mobile')
export class CustomerMobileController {
  constructor(
    private readonly customerMobileService: CustomerMobileService,
    private readonly contractContextService: ContractContextService
  ) {}

  @Get()
  async findAll(): Promise<CustomerMobile[]> {
    return this.customerMobileService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<CustomerMobile | null> {
    return this.customerMobileService.findOne(id);
  }

  @Get('test-context')
  async testContext() {
    const contractId = this.contractContextService.getContractId();
    return {
      message: 'Test contract context',
      contractId,
      timestamp: new Date().toISOString()
    };
  }
} 