import { PermitService } from './permit.service';
export declare class PermitController {
    private readonly permitService;
    constructor(permitService: PermitService);
    findAll(): Promise<import("./permit.entity").Permit[]>;
    getDictionary(): Promise<import("./utility-requirement.entity").UtilityRequirement[]>;
    getDictionaryForCompany(company: string): Promise<import("./utility-requirement.entity").UtilityRequirement[]>;
    findOne(id: string): Promise<import("./permit.entity").Permit | null>;
    create(createPermitDto: any): Promise<import("./permit.entity").Permit>;
    updateStatus(id: string, body: {
        status: string;
        reason?: string;
    }): Promise<import("./permit.entity").Permit>;
    update(id: string, updateData: any): Promise<import("./permit.entity").Permit>;
    remove(id: string): Promise<void>;
}
