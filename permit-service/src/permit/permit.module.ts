import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermitController } from './permit.controller';
import { PermitService } from './permit.service';
import { Permit } from './permit.entity';
import { PermitDocument } from './permit-document.entity';
import { UtilityRequirement } from './utility-requirement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permit, PermitDocument, UtilityRequirement])],
  controllers: [PermitController],
  providers: [PermitService],
})
export class PermitModule {}
