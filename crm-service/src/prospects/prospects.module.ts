import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prospect } from './prospect.entity';
import { CustomerProfile } from './customer.entity';
import { ProspectsService } from './prospects.service';
import { ProspectsController } from './prospects.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Prospect, CustomerProfile])],
  controllers: [ProspectsController],
  providers: [ProspectsService], 
})
export class ProspectsModule {}