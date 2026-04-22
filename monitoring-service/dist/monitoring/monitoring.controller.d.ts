import { MonitoringService } from './monitoring.service';
import { Telemetry } from './telemetry.entity';
export declare class MonitoringController {
    private readonly monitoringService;
    constructor(monitoringService: MonitoringService);
    ingestData(data: Partial<Telemetry>): Promise<Telemetry>;
    findAllInverters(): Promise<import("./inverter.entity").Inverter[]>;
    createInverter(data: any): Promise<import("./inverter.entity").Inverter>;
    updateInverter(id: string, data: any): Promise<import("./inverter.entity").Inverter>;
    removeInverter(id: string): Promise<import("./inverter.entity").Inverter>;
    getDashboard(id: string): Promise<{
        inverters: never[];
        telemetry: never[];
        history?: undefined;
    } | {
        inverters: import("./inverter.entity").Inverter[];
        history: any;
        telemetry?: undefined;
    }>;
    getSavings(id: string): Promise<{
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
