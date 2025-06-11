import { Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Inject } from '@nestjs/common';
import { Request } from 'express';

interface RequestWithContext extends Request {
  contractContext?: {
    contractId?: number;
  };
}

@Injectable({ scope: Scope.REQUEST })
export class ContractContextService {
  constructor(@Inject(REQUEST) private readonly request: RequestWithContext) {}

  setContractId(contractId: number) {
    console.log('setContractId', contractId);
    if (!this.request.contractContext) {
      this.request.contractContext = {};
    }
    this.request.contractContext.contractId = contractId;
  }

  getContractId(): number | undefined {
    console.log('getContractId', this.request.contractContext?.contractId);

    return this.request.contractContext?.contractId;
  }
} 