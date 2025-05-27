import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder, DataSource, FindManyOptions, FindOneOptions } from 'typeorm';
import { CustomerMobile } from '../../entity/customer-mobile.entity';
import { ContractContextService } from './contract-context.service';

@Injectable()
export class CustomerMobileRepository extends Repository<CustomerMobile> {
  private skipContractFilter: boolean = false;

  constructor(private dataSource: DataSource) {
    super(CustomerMobile, dataSource.createEntityManager());
  }

  private applyContractFilter(queryBuilder: SelectQueryBuilder<CustomerMobile>): void {
    if (this.skipContractFilter) return;

    const contractId = ContractContextService.getContractId();
    if (contractId) {
      queryBuilder.innerJoin('customer_mobile.contract', 'contract');
      queryBuilder.where(`contract.id = :contractId`, { contractId });
    }
  }

  // Function để tắt filter mặc định
  skipDefaultFilter(): this {
    this.skipContractFilter = true;
    return this;
  }

  // Function để bật lại filter mặc định
  enableDefaultFilter(): this {
    this.skipContractFilter = false;
    return this;
  }

  find(options?: FindManyOptions<CustomerMobile>): Promise<CustomerMobile[]> {
    const queryBuilder = this.createQueryBuilder('customer_mobile');

    if (options?.where) {
       queryBuilder.andWhere(options?.where || {}) ;
    }

    console.log(queryBuilder.getQueryAndParameters());

    return queryBuilder.getMany();
  }

  findOne(options: FindOneOptions<CustomerMobile>): Promise<CustomerMobile | null> {
    const queryBuilder = this.createQueryBuilder('customer_mobile');

    if (options?.where) {
      queryBuilder.andWhere(options?.where || {}) ;
    }

    console.log(queryBuilder.getQueryAndParameters());

    return queryBuilder.getOne();
  }

  createQueryBuilder(alias: string = 'customer_mobile'): SelectQueryBuilder<CustomerMobile> {
    const queryBuilder = super.createQueryBuilder(alias);
    this.applyContractFilter(queryBuilder);
    console.log(queryBuilder.getQueryAndParameters());
    return queryBuilder;
  }
} 