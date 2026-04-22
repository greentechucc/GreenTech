import { Module } from '@nestjs/common';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerUser } from './customer-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerUser])],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}
