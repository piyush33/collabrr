import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
    private s3: AWS.S3;

    constructor() {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION,
        });
    }

    async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
        const { originalname } = file;
        const bucketS3 = process.env.AWS_BUCKET_NAME;
        const fileKey = `${folder}/${uuidv4()}-${originalname}`;

        const params = {
            Bucket: bucketS3,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        const data = await this.s3.upload(params).promise();
        return data.Location; // Return the file URL
    }

    async deleteFile(fileKey: string): Promise<void> {
        const bucketS3 = process.env.AWS_BUCKET_NAME;
        const params = {
            Bucket: bucketS3,
            Key: fileKey,
        };

        await this.s3.deleteObject(params).promise();
    }
}
