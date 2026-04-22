import { OnApplicationBootstrap } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Telemetry } from './telemetry.entity';
import { Inverter } from './inverter.entity';
export declare class MonitoringService implements OnApplicationBootstrap {
    private telemetryRepo;
    private inverterRepo;
    private dataSource;
    private readonly logger;
    private redisPub;
    constructor(telemetryRepo: Repository<Telemetry>, inverterRepo: Repository<Inverter>, dataSource: DataSource);
    onApplicationBootstrap(): Promise<void>;
    ingestTelemetry(data: Partial<Telemetry>): Promise<Telemetry>;
    findAllInverters(): Promise<Inverter[]>;
    createInverter(data: Partial<Inverter>): Promise<Inverter>;
    updateInverter(id: number, data: Partial<Inverter>): Promise<Inverter>;
    removeInverter(id: number): Promise<Inverter>;
    getDashboard(projectId: number): Promise<{
        inverters: never[];
        telemetry: never[];
        history?: undefined;
    } | {
        inverters: Inverter[];
        history: any;
        telemetry?: undefined;
    }>;
    calculateSavings(projectId: number): Promise<{
        saved_kwh: number;
        savings_cop: number;
        tarifa_promedio: number;
        period?: undefined;
    } | {
        saved_kwh: any;
        savings_cop: number;
        tarifa_promedio: number;
        period: string;
    }>;
}
