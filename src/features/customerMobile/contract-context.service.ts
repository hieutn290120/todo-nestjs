import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class ContractContextService {
  private contractId: number | string;

  setContractId(contractId: number | string) {
    console.log('setContractId', contractId);
    this.contractId = contractId;
  }

  getContractId(): number | string {
    console.log('getContractId', this.contractId);
    return this.contractId;
  }
} 