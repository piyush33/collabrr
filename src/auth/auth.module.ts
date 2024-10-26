import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { LocalAuthGuard } from './local-auth.guard';
import { UsersModule } from '../users/users.module';
import { GoogleStrategy } from './google.strategy';
import { ProfileusersService } from 'src/profileusers/profileusers.service';
import { ProfileusersModule } from 'src/profileusers/profileusers.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey', // Use a secure secret in production
      signOptions: { expiresIn: '1h' },
    }),
    ProfileusersModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy, LocalAuthGuard, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule { }
