import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { OtpDto } from './dto/otp.dto';
// import { RegisterDto, OtpDto } from '.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: RegisterDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout() {
    return { message: 'Logged out' }; // Client handles token
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-otp')
  sendOtp(@Req() req) {
    return this.authService.sendOtp(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('resend-otp')
  resendOtp(@Req() req) {
    return this.authService.resendOtp(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-otp')
  verifyOtp(@Req() req, @Body() dto: OtpDto) {
    return this.authService.verifyOtp(req.user.id, dto);
  }
}