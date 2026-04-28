import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class CustomerUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column('text', { nullable: true })
  avatar_url: string;

  @Column({ nullable: true })
  reset_code: string;

  @Column({ type: 'timestamp', nullable: true })
  reset_expires_at: Date;

  @Column({ type: 'int', default: 0 })
  failed_login_attempts: number;

  @Column({ type: 'timestamp', nullable: true })
  login_locked_until: Date;

  @Column({ type: 'int', default: 0 })
  failed_reset_attempts: number;

  @Column({ type: 'timestamp', nullable: true })
  reset_locked_until: Date;

  @Column({ nullable: true })
  unlock_token: string;

  @CreateDateColumn()
  created_at: Date;
}
