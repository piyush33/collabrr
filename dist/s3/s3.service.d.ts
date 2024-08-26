export declare class S3Service {
    private s3;
    constructor();
    uploadFile(file: Express.Multer.File, folder: string): Promise<string>;
    deleteFile(fileKey: string): Promise<void>;
}
