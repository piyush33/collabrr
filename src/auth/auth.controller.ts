// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { User } from '../users/user.entity';
import { OAuth2Client } from 'google-auth-library';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Local login -> returns { access_token, user, profileUser }
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // Sign up -> creates User (+ProfileUser if missing) and returns the created user
  // (If you prefer auto-login after signup, swap to `return this.authService.login(createdUser)`.)
  @Post('signup')
  async signup(@Body() createUserDto: Partial<User>) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Request() req) {
    return req.user; // now includes profileUserId and email
  }

  // Google OAuth -> upsert user & profileuser, then return { access_token, user, profileUser }
  @Post('google')
  async googleAuth(@Body('token') token: string) {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const user = await this.authService.validateOAuthUser({
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
    });

    return this.authService.login(user);
  }
}
