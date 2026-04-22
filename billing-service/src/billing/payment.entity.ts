import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  invoice_id: number;

  @ManyToOne(() => Invoice, invoice => invoice.payments)
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ nullable: true })
  transaction_id: string;

  @Column('float')
  amount: number;

  @Column()
  payment_method: string;

  @Column({ default: 'COMPLETED' })
  status: string;

  @CreateDateColumn()
  created_at: Date;
}
