import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id: string;

  @Column({ nullable: true })
  user_email: string;

  @Column({ nullable: true })
  user_role: string;

  @Column()
  action: string; // 'CREATE' | 'UPDATE' | 'DELETE'

  @Column()
  entity: string; // 'Project' | 'Quotation' | 'Invoice' | 'Prospect'

  @Column({ nullable: true })
  entity_id: string;

  @Column({ type: 'text', nullable: true })
  details: string; // JSON stringified changes

  @CreateDateColumn()
  created_at: Date;
}
