import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ContractContextMiddleware implements NestMiddleware {
  use(req: Request | any, res: Response, next: NextFunction) {
    const contractId = req?.url ? req?.url?.slice(1,2) : null;
    
    // Lưu contractId vào request context
    req.contractContext = {
      contractId: contractId
    };
    
    console.log('Contract ID from URL:', contractId);
    next();
  }
} 