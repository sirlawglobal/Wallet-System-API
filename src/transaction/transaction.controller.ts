import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { TransferDto } from './dto/transfer.dto';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Post('transfers')
  @Roles('user')
  transfer(@Req() req, @Body() dto: TransferDto) {
    return this.transactionService.transfer(req.user.id, dto);
  }

  @Get('transactions')
  @Roles('user')
  getMyTransactions(@Req() req) {
    return this.transactionService.getMyTransactions(req.user.id);
  }
}