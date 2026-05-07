import { Module } from '@nestjs/common';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';
import { MailService } from './mail.service';
import { JwtModule } from '@nestjs/jwt';

import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerUser } from './customer-user.entity';
import { Ticket } from './ticket.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerUser, Ticket]),
    JwtModule.register({
      secret: 'GREEN-TECH-MASTER-SECRET-2026',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [PortalController],
  providers: [PortalService, MailService],
})
export class PortalModule {}
