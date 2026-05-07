import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('staff_users')
export class StaffUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ default: 'Asesor' })
  role: string; // 'Admin' | 'Asesor' | 'Proyectos' | 'Bodega' | 'Tecnico' | 'Soporte'

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;
}
