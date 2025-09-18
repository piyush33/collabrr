// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

type JwtPayload = {
  sub: number;
  username: string;
  email?: string;
  profileUserId?: number;
  iat?: number;
  exp?: number;
};

// Optional: also read token from a cookie named "token"
const cookieExtractor = (req: any) => {
  if (req?.cookies?.token) return req.cookies.token;
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor, // optional fallback
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'secretKey',
    });
  }

  async validate(payload: JwtPayload) {
    // attach everything downstream routes need
    return {
      userId: payload.sub,
      username: payload.username,
      email: payload.email ?? null,
      profileUserId: payload.profileUserId ?? null,
    };
  }
}
