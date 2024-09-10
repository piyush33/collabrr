"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignatureValidationMiddleware = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const node_fetch_1 = __importDefault(require("node-fetch"));
let SignatureValidationMiddleware = class SignatureValidationMiddleware {
    async use(req, res, next) {
        const signatureHeader = req.headers['signature'];
        const digestHeader = req.headers['digest'];
        if (!signatureHeader || !digestHeader) {
            throw new common_1.BadRequestException('Missing signature or digest header');
        }
        const bodyDigest = crypto.createHash('sha256').update(JSON.stringify(req.body)).digest('base64');
        if (digestHeader !== `SHA-256=${bodyDigest}`) {
            throw new common_1.BadRequestException('Invalid digest');
        }
        const { keyId, signature, headers } = this.parseSignatureHeader(signatureHeader);
        const publicKey = await this.fetchPublicKey(keyId);
        const isSignatureValid = this.verifySignature(req, headers, signature, publicKey);
        if (!isSignatureValid) {
            throw new common_1.BadRequestException('Invalid signature');
        }
        next();
    }
    parseSignatureHeader(signatureHeader) {
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
    async fetchPublicKey(keyId) {
        const response = await (0, node_fetch_1.default)(keyId);
        if (!response.ok) {
            throw new common_1.BadRequestException('Failed to fetch public key');
        }
        const data = (await response.json());
        if (!data.publicKeyPem) {
            throw new common_1.BadRequestException('Invalid public key response');
        }
        return data.publicKeyPem;
    }
    verifySignature(req, headers, signature, publicKey) {
        const signingString = headers.map(header => `${header}: ${req.headers[header]}`).join('\n');
        const verifier = crypto.createVerify('SHA256');
        verifier.update(signingString);
        verifier.end();
        return verifier.verify(publicKey, signature, 'base64');
    }
};
exports.SignatureValidationMiddleware = SignatureValidationMiddleware;
exports.SignatureValidationMiddleware = SignatureValidationMiddleware = __decorate([
    (0, common_1.Injectable)()
], SignatureValidationMiddleware);
//# sourceMappingURL=signature-validation.middleware.js.map