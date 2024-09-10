import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import fetch from 'node-fetch';

interface PublicKeyResponse {
    publicKeyPem: string;  // Define the structure for the public key response
}

@Injectable()
export class SignatureValidationMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: NextFunction) {
        const signatureHeader = req.headers['signature'] as string;
        const digestHeader = req.headers['digest'] as string;

        if (!signatureHeader || !digestHeader) {
            throw new BadRequestException('Missing signature or digest header');
        }

        // Verify the digest header matches the body
        const bodyDigest = crypto.createHash('sha256').update(JSON.stringify(req.body)).digest('base64');
        if (digestHeader !== `SHA-256=${bodyDigest}`) {
            throw new BadRequestException('Invalid digest');
        }

        // Parse the Signature Header
        const { keyId, signature, headers } = this.parseSignatureHeader(signatureHeader);

        // Fetch Public Key from keyId URL
        const publicKey = await this.fetchPublicKey(keyId);

        // Verify Signature
        const isSignatureValid = this.verifySignature(req, headers, signature, publicKey);
        if (!isSignatureValid) {
            throw new BadRequestException('Invalid signature');
        }

        next();
    }

    parseSignatureHeader(signatureHeader: string): any {
        // Basic parsing logic (You might need a more robust parser depending on your signature header structure)
        const parts = signatureHeader.split(',');
        const signatureInfo = {};
        parts.forEach(part => {
            const [key, value] = part.split('=');
            signatureInfo[key.trim()] = value.replace(/"/g, '');
        });
        return {
            keyId: signatureInfo['keyId'],
            signature: signatureInfo['signature'],
            headers: signatureInfo['headers'].split(' ')
        };
    }

    async fetchPublicKey(keyId: string): Promise<string> {
        // Fetch the public key using the keyId URL
        const response = await fetch(keyId);
        if (!response.ok) {
            throw new BadRequestException('Failed to fetch public key');
        }
        const data = (await response.json()) as PublicKeyResponse;  // Type assertion for the expected response

        if (!data.publicKeyPem) {
            throw new BadRequestException('Invalid public key response');
        }

        return data.publicKeyPem;
    }

    verifySignature(req: Request, headers: string[], signature: string, publicKey: string): boolean {
        const signingString = headers.map(header => `${header}: ${req.headers[header]}`).join('\n');
        const verifier = crypto.createVerify('SHA256');
        verifier.update(signingString);
        verifier.end();
        return verifier.verify(publicKey, signature, 'base64');
    }
}
