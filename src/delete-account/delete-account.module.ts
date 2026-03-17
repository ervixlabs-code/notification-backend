import { Module } from '@nestjs/common';
import { DeleteAccountController } from './delete-account.controller';
import { DeleteAccountService } from './delete-account.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DeleteAccountController],
  providers: [DeleteAccountService, PrismaService],
})
export class DeleteAccountModule {}
