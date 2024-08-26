import { S3Service } from './s3.service';
export declare class UploadController {
    private readonly s3Service;
    constructor(s3Service: S3Service);
    uploadFeedItemImage(file: Express.Multer.File): Promise<{
        imageUrl: string;
    }>;
    uploadProfileImage(file: Express.Multer.File): Promise<{
        imageUrl: string;
    }>;
}
