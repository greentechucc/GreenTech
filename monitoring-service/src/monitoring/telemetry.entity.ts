import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('telemetry')
export class Telemetry {
  @PrimaryColumn({ type: 'timestamp' })
  time: Date;

  @PrimaryColumn()
  inverter_id: string;

  @Column('float')
  power_output_kw: number;

  @Column('float')
  daily_yield_kwh: number;

  @Column('float')
  total_yield_kwh: number;

  @Column('float', { nullable: true })
  temperature: number;

  @Column()
  status: string;
}
