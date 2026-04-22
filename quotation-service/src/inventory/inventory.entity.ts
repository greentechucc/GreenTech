import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  sku: string;

  @Column()
  name: string;

  @Column()
  category: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'int', default: 0 })
  min_stock: number;

  @Column({ default: 'pza' })
  unit: string;

  @Column({ type: 'float', default: 0 })
  unit_price: number;

  @Column({ nullable: true })
  supplier_name: string;

  @Column({ type: 'int', default: 0 })
  reserved_stock: number;

  @Column({ default: 'AVAILABLE' })
  status: string;
}
