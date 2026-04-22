import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('customers')
export class CustomerProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  consumption_type: string; // 'Residencial', 'Comercial', 'Industrial'

  @Column({ nullable: true })
  assigned_rep: string;

  @CreateDateColumn()
  converted_at: Date;
}
