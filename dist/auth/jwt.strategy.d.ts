import { ConfigService } from '@nestjs/config';
type JwtPayload = {
    sub: number;
    username: string;
    email?: string;
    profileUserId?: number;
    iat?: number;
    exp?: number;
};
declare const JwtStrategy_base: new (...args: any[]) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(config: ConfigService);
    validate(payload: JwtPayload): Promise<{
        userId: number;
        username: string;
        email: string;
        profileUserId: number;
    }>;
}
export {};
