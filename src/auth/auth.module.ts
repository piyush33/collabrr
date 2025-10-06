import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { LocalAuthGuard } from './local-auth.guard';
import { UsersModule } from '../users/users.module';
import { ProfileusersModule } from 'src/profileusers/profileusers.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileUser } from 'src/profileusers/profileuser.entity';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    TypeOrmModule.forFeature([ProfileUser]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey', // Use a secure secret in production
      signOptions: { expiresIn: '7d' },
    }),
    ProfileusersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy, LocalAuthGuard],
  exports: [AuthService],
})
export class AuthModule {}
