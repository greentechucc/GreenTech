import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Project {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customer_name: string;

  @Column()
  customer_email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  system_size: string;

  @Column({ default: 'CREATED' })
  status: string;

  @Column({ type: 'int', default: 0 })
  completion: number;

  @Column('float', { nullable: true, default: 0 })
  estimated_amount: number;

  @Column({ type: 'varchar', nullable: true })
  assigned_crew: string | null;

  @Column({ type: 'timestamp', nullable: true })
  planned_start_date: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  planned_end_date: Date | null;

  @Column({ type: 'text', nullable: true })
  tasks: string;

  @Column({ type: 'text', nullable: true })
  bom_json: string;

  @Column("simple-array", { nullable: true })
  assigned_auxiliaries: string[];

  @CreateDateColumn()
  created_at: Date;
}