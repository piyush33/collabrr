import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsString()
    name: string;

    @IsString()
    tagline: string;

    @IsString()
    username: string;

    @IsArray()
    @IsOptional()
    followers?: string[];

    @IsArray()
    @IsOptional()
    following?: string[];
}
