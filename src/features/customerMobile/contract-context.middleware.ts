import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ContractContextService } from './contract-context.service';

@Injectable()
export class ContractContextMiddleware implements NestMiddleware {
  constructor(private readonly contractContextService: ContractContextService) {}

  use(req: Request | any, res: Response, next: NextFunction) {
    // Lấy contractId từ header của request
    const contractId = req?.url ? req?.url?.slice(1,2) : null;
    
    // Log để debug
    console.log('Contract ID from header:', contractId);

    if (contractId) {
      this.contractContextService.setContractId(contractId);
    }
    next();
  }
} 