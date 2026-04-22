import { Repository } from 'typeorm';
import { Permit } from './permit.entity';
import { PermitDocument } from './permit-document.entity';
import { UtilityRequirement } from './utility-requirement.entity';
import { OnModuleInit } from '@nestjs/common';
export declare class PermitService implements OnModuleInit {
    private permitRepository;
    private documentRepository;
    private utilityReqRepository;
    private readonly logger;
    private redisPub;
    private redisSub;
    constructor(permitRepository: Repository<Permit>, documentRepository: Repository<PermitDocument>, utilityReqRepository: Repository<UtilityRequirement>);
    onModuleInit(): Promise<void>;
    getUtilityRequirements(): Promise<UtilityRequirement[]>;
    getRequirementsForCompany(company: string): Promise<UtilityRequirement[]>;
    private initSubscriptions;
    findAll(): Promise<Permit[]>;
    findOne(id: number): Promise<Permit | null>;
    create(data: Partial<Permit>): Promise<Permit>;
    autoCreatePermit(projectId: number): Promise<void>;
    updateStatus(id: number, status: string, reason?: string): Promise<Permit>;
    update(id: number, data: Partial<Permit>): Promise<Permit>;
    remove(id: number): Promise<void>;
}
