import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_email' })
  customer_email: string;

  @Column()
  subject: string;

  @Column('text')
  description: string;

  @Column({ default: 'OPEN' })
  status: string;

  @Column({ nullable: true })
  resolution: string;

  @Column({ nullable: true })
  assigned_to: string;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
