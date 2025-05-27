import { Injectable, Inject } from '@nestjs/common';
import { CustomerMobile } from '../../entity/customer-mobile.entity';
import { CustomerMobileRepository } from './customer-mobile.repository';

@Injectable()
export class CustomerMobileService {
  constructor(
    @Inject(CustomerMobileRepository)
    private customerMobileRepository: CustomerMobileRepository,
  ) {}

  async findAll(): Promise<CustomerMobile[]> {
    return this.customerMobileRepository.find({
      where: {
        id: 1
      }
    });
  }

  async findOne(id: number): Promise<CustomerMobile | null> {
    return this.customerMobileRepository.findOne({ where: { id } });
  }

  // Tìm tất cả customer mobile mà không áp dụng filter contract
  async findAllWithoutContractFilter(): Promise<CustomerMobile[]> {
    return this.customerMobileRepository
      .skipDefaultFilter()
      .find();
  }

  // Tìm một customer mobile mà không áp dụng filter contract
  async findOneWithoutContractFilter(id: number): Promise<CustomerMobile | null> {
    return this.customerMobileRepository
      .skipDefaultFilter()
      .findOne({ where: { id } });
  }
} 