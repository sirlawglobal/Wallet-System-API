import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Wallet } from './wallet.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  type: 'credit' | 'debit' | 'transfer';

  @ManyToOne(() => Wallet, (wallet) => wallet.fromTransactions, { nullable: true })
  fromWallet: Wallet;

  @ManyToOne(() => Wallet, (wallet) => wallet.toTransactions)
  toWallet: Wallet;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}