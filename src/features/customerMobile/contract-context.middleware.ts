import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ContractContextService } from './contract-context.service';

@Injectable()
export class ContractContextMiddleware implements NestMiddleware {
  use(req: Request | any, res: Response, next: NextFunction) {
    const contractId = 1111;
    if (contractId) {
      ContractContextService.setContractId(contractId);
    }
    next();
  }
} 