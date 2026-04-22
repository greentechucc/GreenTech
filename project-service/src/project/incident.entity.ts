import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './project.entity';

@Entity('project_incidents')
export class Incident {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  project_id: number;

  @ManyToOne(() => Project, project => project.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  type: string; // Ej: 'CLIMA', 'PERMISOS', 'MATERIAL_FALTANTE', 'CLIENTE_PIDE_PAUSA'

  @Column('text')
  description: string;

  @Column({ default: 'OPEN' })
  status: string; // OPEN, RESOLVED

  @CreateDateColumn()
  reported_at: Date;
}
