import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('inverters')
export class Inverter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  project_id: number;

  @Column()
  serial_number: string;

  @Column()
  model: string;

  @Column({ type: 'timestamp' })
  installation_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_communication: Date;

  @Column({ default: 'OFFLINE' })
  status: string;
}
