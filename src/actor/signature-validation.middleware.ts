import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class SignatureValidationMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const signature = req.headers['signature'];
        const digest = req.headers['digest'];

        if (!signature || !digest) {
            throw new BadRequestException('Missing signature or digest header');
        }

        // Verify the digest header matches the body
        const bodyDigest = crypto.createHash('sha256').update(req.body).digest('base64');
        if (digest !== `SHA-256=${bodyDigest}`) {
            throw new BadRequestException('Invalid digest');
        }

        // Add additional signature verification (e.g., using public key cryptography)
        next();
    }
}
