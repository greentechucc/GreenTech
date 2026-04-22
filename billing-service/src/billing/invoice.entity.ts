import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Payment } from './payment.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  project_id: number;

  @Column({ nullable: true })
  customer_id: number;

  @Column({ nullable: true })
  customer_name: string;

  @Column({ nullable: true })
  concept: string;

  @Column('float')
  amount: number;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  due_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Payment, payment => payment.invoice)
  payments: Payment[];
}
