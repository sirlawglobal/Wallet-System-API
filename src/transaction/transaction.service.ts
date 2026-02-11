import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Wallet } from '../entities/wallet.entity';
import { User } from '../entities/user.entity';
import { TransferDto } from './dto/transfer.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private dataSource: DataSource,
  ) {}

//   async transfer(fromUserId: string, dto: TransferDto) {
//     return this.dataSource.transaction(async (manager) => {
//       const fromWallet = await manager.findOne(Wallet, {
//         where: { user: { id: fromUserId } },
//         lock: { mode: 'pessimistic_write' },
//       });

//       if (!fromWallet) throw new BadRequestException('Sender wallet not found');
//       if (fromWallet.balance < dto.amount) {
//         throw new BadRequestException('Insufficient funds');
//       }

//       const toUser = await manager.findOne(User, { where: { email: dto.toEmail } });
//       if (!toUser) throw new BadRequestException('Recipient not found');

//       const toWallet = await manager.findOne(Wallet, {
//         where: { user: { id: toUser.id } },
//         lock: { mode: 'pessimistic_write' },
//       });

//       if (!toWallet) throw new BadRequestException('Recipient wallet not found');

//       fromWallet.balance -= dto.amount;
//       toWallet.balance  += dto.amount;

//       await manager.save([fromWallet, toWallet]);

//       const tx = manager.create(Transaction, {
//         amount: dto.amount,
//         type: 'transfer',
//         fromWallet,
//         toWallet,
//       });

//       await manager.save(tx);

//       return { message: 'Transfer successful' };
//     });
//   }

async transfer(fromUserId: string, dto: TransferDto) {
  return this.dataSource.transaction(async (manager) => {
    // ────────────────────────────────────────────────
    console.log(`[TRANSFER START] amount: ${dto.amount} (${typeof dto.amount})`);
    // ────────────────────────────────────────────────

    const fromWallet = await manager.findOne(Wallet, {
      where: { user: { id: fromUserId } },
      lock: { mode: 'pessimistic_write' },
    });

    if (!fromWallet) throw new BadRequestException('Sender wallet not found');

    // ────────────────────────────────────────────────
    console.log(`From wallet ${fromWallet.id} - before: ${fromWallet.balance} (${typeof fromWallet.balance})`);
    // ────────────────────────────────────────────────

    if (Number(fromWallet.balance) < Number(dto.amount)) {
      throw new BadRequestException('Insufficient funds');
    }

    const toUser = await manager.findOne(User, { where: { email: dto.toEmail } });
    if (!toUser) throw new BadRequestException('Recipient not found');

    const toWallet = await manager.findOne(Wallet, {
      where: { user: { id: toUser.id } },
      lock: { mode: 'pessimistic_write' },
    });

    if (!toWallet) throw new BadRequestException('Recipient wallet not found');

    // ────────────────────────────────────────────────
    console.log(`To   wallet ${toWallet.id} - before: ${toWallet.balance} (${typeof toWallet.balance})`);
    // ────────────────────────────────────────────────

    const amount = Number(dto.amount);           // force number

    const oldFrom = Number(fromWallet.balance);
    const oldTo   = Number(toWallet.balance);

    fromWallet.balance = oldFrom - amount;
    toWallet.balance   = oldTo   + amount;

    // ────────────────────────────────────────────────
    console.log(`After calc → from: ${fromWallet.balance}  to: ${toWallet.balance}`);
    // ────────────────────────────────────────────────

    // Force TypeORM to notice the change
    await manager.save(fromWallet);
    await manager.save(toWallet);   // save one by one — more reliable in some versions

    // ────────────────────────────────────────────────
    console.log(`After save (individual) → from: ${fromWallet.balance}  to: ${toWallet.balance}`);
    // ────────────────────────────────────────────────

    const tx = manager.create(Transaction, {
      amount,
      type: 'transfer',
      fromWallet,
      toWallet,
    });

    await manager.save(tx);

    return { 
      message: 'Transfer successful',
      debug: {
        fromWalletId: fromWallet.id,
        toWalletId:   toWallet.id,
        oldFrom: oldFrom,
        oldTo:   oldTo,
        amount,
        newFrom: fromWallet.balance,
        newTo:   toWallet.balance
      }
    };
  });
}

  async getMyTransactions(userId: string) {
    const wallet = await this.walletRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
      // or: return [];
    }

    return this.txRepo.find({
      where: [
        { fromWallet: { id: wallet.id } },
        { toWallet:  { id: wallet.id } },
      ],
      order: { timestamp: 'DESC' },
      // optional but recommended:
      relations: ['fromWallet', 'toWallet'],
    });
  }
}