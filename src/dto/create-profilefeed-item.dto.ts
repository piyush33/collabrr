import { IsString, IsOptional } from 'class-validator';

export class CreateProfileFeedItemDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsString()
    @IsOptional()
    image?: string;

    @IsString()
    @IsOptional()
    text?: string;

    @IsString()
    @IsOptional()
    parent?: string;

    @IsString()
    @IsOptional()
    username: string;
}
