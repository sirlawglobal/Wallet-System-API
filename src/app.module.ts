
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';
import { TransactionModule } from './transaction/transaction.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Loads .env
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.SUPABASE_DB_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Dev only; use migrations in prod
      logging: true,
    }),
    AuthModule,
    WalletModule,
  
    TransactionModule,
    AdminModule,
  
 
  ],
})
export class AppModule {}