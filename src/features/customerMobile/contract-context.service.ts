import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class ContractContextService {
  private static contractId: number;

  static setContractId(contractId: number) {
    ContractContextService.contractId = contractId;
  }

  static getContractId(): number {
    return ContractContextService.contractId;
  }
} 