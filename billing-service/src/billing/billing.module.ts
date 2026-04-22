import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { Invoice } from './invoice.entity';
import { Payment } from './payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Payment])],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}
