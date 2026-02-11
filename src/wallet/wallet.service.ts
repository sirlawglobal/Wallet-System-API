import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { Transaction } from '../entities/transaction.entity';
import { FundDto } from './dto/fund.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
    private dataSource: DataSource,
  ) {}

  async getMyWallet(userId: string) {
    return this.walletRepo.findOne({ where: { user: { id: userId } } });
  }

//   async fund(userId: string, dto: FundDto) {
//     return this.dataSource.transaction(async (manager) => {
//       const wallet = await manager.findOne(Wallet, { where: { user: { id: userId } }, lock: { mode: 'pessimistic_write' } }); // Lock for concurrency
//       if (!wallet) throw new BadRequestException('Wallet not found');
//       wallet.balance += dto.amount;
//       await manager.save(wallet);

//       const tx = manager.create(Transaction, { amount: dto.amount, type: 'credit', toWallet: wallet });
//       await manager.save(tx);
//       return { message: 'Wallet funded' };
//     });
//   }

async fund(userId: string, dto: FundDto) {
  return this.dataSource.transaction(async (manager) => {
    const wallet = await manager.findOne(Wallet, {
      where: { user: { id: userId } },
      lock: { mode: 'pessimistic_write' },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    const oldBalance = wallet.balance;
    wallet.balance = Number(wallet.balance) + Number(dto.amount); // avoid any string/precision weirdness

    console.log(
      `Funding wallet ${wallet.id} | user ${userId} | ` +
      `old: ${oldBalance} → new: ${wallet.balance} (amount: ${dto.amount})`
    );

    await manager.save(wallet);

    const tx = manager.create(Transaction, {
      amount: dto.amount,
      type: 'credit',
      toWallet: wallet,
    });

    await manager.save(tx);

    return { 
      message: 'Wallet funded',
      newBalance: wallet.balance 
    };
  });
}
}