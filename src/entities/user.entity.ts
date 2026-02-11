import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Wallet } from './wallet.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Hashed

  @Column({ default: 'user' })
  role: 'user' | 'admin';

  @Column({ type: 'varchar', nullable: true })
  otp: string | null;

  // Fixed: explicit type + nullable
  @Column({ type: 'timestamp', nullable: true })
  otpExpiry: Date | null;

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  wallet: Wallet;
}