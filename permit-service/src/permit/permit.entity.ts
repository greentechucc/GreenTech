import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { PermitDocument } from './permit-document.entity';

@Entity('permits')
export class Permit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  project_id: number;

  @Column()
  utility_company: string;

  @Column()
  permit_type: string;

  @CreateDateColumn()
  application_date: Date;

  @Column({ default: 'NOT_STARTED' })
  status: string;

  @Column({ nullable: true })
  rejection_reason: string;

  @Column({ type: 'timestamp', nullable: true })
  approval_date: Date;

  @OneToMany(() => PermitDocument, document => document.permit, { cascade: true })
  documents: PermitDocument[];
}
