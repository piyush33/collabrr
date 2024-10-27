import { Strategy } from 'passport-google-oauth20';
import { AuthService } from './auth.service';
declare const GoogleStrategy_base: new (...args: any[]) => Strategy;
export declare class GoogleStrategy extends GoogleStrategy_base {
    private authService;
    constructor(authService: AuthService);
}
export {};
