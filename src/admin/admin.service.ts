import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Transaction } from '../entities/transaction.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
  ) {}

  getAllUsers() {
    return this.userRepo.find({ select: ['id', 'email', 'role'] }); // No passwords
  }

  getUserById(id: string) {
    return this.userRepo.findOne({ where: { id }, relations: ['wallet'] });
  }

  getAllTransactions() {
    return this.txRepo.find({ relations: ['fromWallet', 'toWallet'] });
  }

  getTransactionById(id: string) {
    return this.txRepo.findOne({ where: { id }, relations: ['fromWallet', 'toWallet'] });
  }
}