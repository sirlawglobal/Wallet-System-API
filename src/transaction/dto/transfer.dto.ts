import { IsString, IsNumber, Min } from 'class-validator';

export class TransferDto {
  @IsString()
  toEmail: string; // Or toUserId

  @IsNumber()
  @Min(1)
  amount: number;
}