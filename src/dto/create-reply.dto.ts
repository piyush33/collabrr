import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReplyDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    image: string;

    @IsNotEmpty()
    @IsString()
    reply: string;
}
