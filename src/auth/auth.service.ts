import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as speakeasy from 'speakeasy';
import * as nodemailer from 'nodemailer'; // For sending OTP
import { RegisterDto } from './dto/register.dto';
import { OtpDto } from './dto/otp.dto';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
    private jwtService: JwtService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({ email: dto.email, password: hashedPassword, verified: false });
    await this.userRepo.save(user);

    // Auto-create wallet
    const wallet = this.walletRepo.create({ user, balance: 0 });
    await this.walletRepo.save(wallet);

    // Send OTP immediately after registration
    await this.sendOtp(user.id);

    return { message: 'User registered successfully. OTP sent to your email.' };
  }

  async login(dto: RegisterDto) { // Reuse DTO
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.verified) {
      throw new UnauthorizedException('Account not verified. Please verify OTP first.');
    }
    const payload = { sub: user.id, role: user.role };
    return { token: this.jwtService.sign(payload) };
  }

  async sendOtp(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const secret = speakeasy.generateSecret({ length: 20 });
    const otp = speakeasy.totp({ secret: secret.base32, encoding: 'base32' });
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await this.userRepo.save(user);

    // Send email (stubbed; integrate properly)
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your OTP',
      text: `OTP: ${otp}`,
    });

    return { message: 'OTP sent' };
  }

 async verifyOtp(userId: string, dto: OtpDto) {
  const user = await this.userRepo.findOne({ where: { id: userId } });
  if (
    !user ||
    !user.otpExpiry || // Null check here
    new Date() > user.otpExpiry ||
    !user.otp || // Null check for otp
    !(await bcrypt.compare(dto.otp, user.otp))
  ) {
    throw new BadRequestException('Invalid or expired OTP');
  }
  user.otp = null;
  user.otpExpiry = null;
  user.verified = true;
  await this.userRepo.save(user);
  return { message: 'OTP verified' };
}

  async resendOtp(userId: string) {
    return this.sendOtp(userId); // Same logic
  }

  // Logout: Client-side token discard; optional server blacklist
}