import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Permit } from './permit.entity';

@Entity('permit_documents')
export class PermitDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  permit_id: number;

  @ManyToOne(() => Permit, permit => permit.documents)
  @JoinColumn({ name: 'permit_id' })
  permit: Permit;

  @Column()
  document_type: string;

  @Column()
  file_url: string;

  @CreateDateColumn()
  uploaded_at: Date;
}
