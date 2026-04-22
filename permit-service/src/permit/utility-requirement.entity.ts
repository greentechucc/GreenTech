import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('utility_requirements')
export class UtilityRequirement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  utility_company: string; // Ej: 'EPM', 'Enel', 'Celsia', 'Air-E'

  @Column()
  permit_type: string; // Ej: 'Conexión', 'Certificación RETIE', 'Disponibilidad'

  @Column('text')
  required_documents: string; // JSON Array de nombres de documentos requeridos

  @Column({ type: 'int', default: 30 })
  estimated_processing_days: number;

  @Column('text', { nullable: true })
  additional_notes: string;
}
