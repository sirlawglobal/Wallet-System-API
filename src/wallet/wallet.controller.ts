import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { FundDto } from './dto/fund.dto';

@Controller('wallets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('my-wallet')
  getMyWallet(@Req() req) {
    return this.walletService.getMyWallet(req.user.id);
  }

  @Post('fund')
  @Roles('user')
  fund(@Req() req, @Body() dto: FundDto) {
    return this.walletService.fund(req.user.id, dto);
  }
}