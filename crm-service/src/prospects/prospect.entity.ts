import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Prospect {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ default: 'NEW' })
  status: string;

  @Column({ nullable: true })
  consumption: string;

  @Column({ nullable: true, default: 'Web' })
  source: string;

  @Column({ nullable: true })
  assigned_rep: string;
}