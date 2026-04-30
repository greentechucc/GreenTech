import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Quotation {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customer_name: string;

  @Column({ nullable: true })
  customer_email: string;

  @Column()
  consumo_kwh: number;

  @Column('float')
  system_size_kwp: number;

  @Column()
  panel_count: number;

  @Column('float')
  total_price: number;

  @Column({ default: 'DRAFT' })
  status: string;

  @Column('float', { nullable: true })
  roi_years: number;

  @Column('float', { nullable: true })
  co2_saved_tons: number;

  @Column('float', { nullable: true, default: 0 })
  discount_applied: number;

  @Column({ type: 'text', nullable: true })
  financing_options: string;

  // BOM (Bill of Materials) almacenado como JSON
  @Column({ type: 'text', nullable: true })
  bom_json: string;
}