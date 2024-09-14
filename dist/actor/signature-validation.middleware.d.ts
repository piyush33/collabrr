import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class SignatureValidationMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
    parseSignatureHeader(signatureHeader: string): any;
    fetchPublicKey(keyId: string): Promise<string>;
}
