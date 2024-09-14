import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
const fetch = require('node-fetch');



interface PublicKeyResponse {
    '@context': any[];  // Context array that can contain multiple items
    id: string;  // The ID of the actor
    type: string;  // The type of the actor
    inbox: string;  // Inbox URL
    outbox: string;  // Outbox URL
    preferredUsername: string;  // Preferred username of the actor
    publicKey: {
        id: string;  // ID of the public key
        owner: string;  // Owner of the public key
        publicKeyPem: string;  // The actual public key in PEM format
    };
    endpoints?: {  // Optional endpoints like sharedInbox
        sharedInbox?: string;
    };
}

@Injectable()
export class SignatureValidationMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: NextFunction) {
        const signatureHeader = req.headers['signature'] as string;
        if (!signatureHeader) {
            throw new BadRequestException('Missing signature header');
        }

        console.log('Parsed Signature Header:', signatureHeader);

        // Parse the Signature Header
        const { keyId, signature, headers } = this.parseSignatureHeader(signatureHeader);
        console.log('Signature:', signature);


        // Fetch Public Key from Mastodon
        const publicKey = await this.fetchPublicKey(keyId);

        console.log('Public Key:', publicKey);


        // Recreate the signing string
        const { method, originalUrl } = req;
        const requestTarget = `(request-target): ${method.toLowerCase()} ${originalUrl.toLowerCase()}`;
        const signingString = [
            requestTarget, // Add the request-target manually
            ...headers.filter(header => header !== '(request-target)').map(header => `${header.toLowerCase()}: ${req.headers[header.toLowerCase()]}`)
        ].join('\n');

        console.log('Signature String:', signingString);

        // Verify Signature
        const verifier = crypto.createVerify('RSA-SHA256');
        verifier.update(signingString);
        verifier.end();

        const isSignatureValid = verifier.verify(publicKey, signature, 'base64');
        if (!isSignatureValid) {
            throw new BadRequestException('Invalid signature');
        }

        next();
    }

    parseSignatureHeader(signatureHeader: string): any {
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

        const publicKeyUrl = keyId.split('#')[0]; // Strip off the fragment (#main-key)
        console.log("Fetching public key from:", publicKeyUrl);

        const response = await fetch(publicKeyUrl);

        if (!response.ok) {
            throw new BadRequestException('Failed to fetch public key');
        }
        console.log("response:", response);
        const data = await response.json() as PublicKeyResponse;

        if (!data.publicKey || !data.publicKey.publicKeyPem) {
            throw new BadRequestException('Invalid public key response');
        }

        return data.publicKey.publicKeyPem;
    }

}
