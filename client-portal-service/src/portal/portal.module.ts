import { Module } from '@nestjs/common';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';
import { MailService } from './mail.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerUser } from './customer-user.entity';
import { Ticket } from './ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerUser, Ticket])],
  controllers: [PortalController],
  providers: [PortalService, MailService],
})
export class PortalModule {}
