import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('kpi_records')
export class KpiRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  metric_name: string; // Ej: 'LEAD_CREATED', 'LEAD_CONVERTED', 'PROJECT_COMPLETED'

  @Column({ type: 'int', default: 1 })
  value: number;

  @CreateDateColumn()
  created_at: Date;
}
