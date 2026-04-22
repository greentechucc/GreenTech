import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quotation } from './quotation.entity';
import { InventoryItem } from '../inventory/inventory.entity';
import { QuotationService } from './quotation.service';
import { QuotationController } from './quotation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quotation, InventoryItem]),
  ],
  controllers: [QuotationController],
  providers: [QuotationService],
})
export class QuotationModule {}