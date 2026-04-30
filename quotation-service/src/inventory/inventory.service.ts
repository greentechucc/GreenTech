import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from './inventory.entity';
import Redis from 'ioredis';

const SEED_DATA: Partial<InventoryItem>[] = [
  // Paneles Solares
  { sku: 'PAN-550W-JA', name: 'Panel Solar JA Solar 550W Mono PERC', category: 'Paneles Solares', stock: 200, min_stock: 20, unit: 'und', unit_price: 980000, status: 'AVAILABLE' },
  { sku: 'PAN-450W-LON', name: 'Panel Solar LONGi 450W Hi-MO 5', category: 'Paneles Solares', stock: 150, min_stock: 15, unit: 'und', unit_price: 850000, status: 'AVAILABLE' },
  { sku: 'PAN-660W-TRINA', name: 'Panel Solar Trina Vertex 660W', category: 'Paneles Solares', stock: 80, min_stock: 10, unit: 'und', unit_price: 1250000, status: 'AVAILABLE' },
  { sku: 'PAN-405W-CANA', name: 'Panel Solar Canadian Solar 405W Mono', category: 'Paneles Solares', stock: 120, min_stock: 10, unit: 'und', unit_price: 780000, status: 'AVAILABLE' },

  // Inversores
  { sku: 'INV-5KW-GROW', name: 'Inversor Growatt 5kW On-Grid MIN 5000TL-X', category: 'Inversores', stock: 30, min_stock: 5, unit: 'und', unit_price: 3200000, status: 'AVAILABLE' },
  { sku: 'INV-8KW-GROW', name: 'Inversor Growatt 8kW On-Grid MOD 8000TL3-X', category: 'Inversores', stock: 25, min_stock: 5, unit: 'und', unit_price: 5500000, status: 'AVAILABLE' },
  { sku: 'INV-10KW-HUAW', name: 'Inversor Huawei SUN2000-10KTL-M1', category: 'Inversores', stock: 15, min_stock: 3, unit: 'und', unit_price: 7800000, status: 'AVAILABLE' },
  { sku: 'INV-15KW-SOLI', name: 'Inversor Solis 15kW Trifásico', category: 'Inversores', stock: 10, min_stock: 3, unit: 'und', unit_price: 9500000, status: 'AVAILABLE' },
  { sku: 'INV-25KW-GROW', name: 'Inversor Growatt 25kW MOD 25000TL3-X', category: 'Inversores', stock: 8, min_stock: 2, unit: 'und', unit_price: 14500000, status: 'AVAILABLE' },
  { sku: 'INV-50KW-HUAW', name: 'Inversor Huawei SUN2000-50KTL-M3', category: 'Inversores', stock: 5, min_stock: 2, unit: 'und', unit_price: 28000000, status: 'AVAILABLE' },

  // Estructuras de montaje
  { sku: 'EST-TECHO-ALU', name: 'Estructura Riel Aluminio Techo (kit 4 paneles)', category: 'Estructuras', stock: 60, min_stock: 10, unit: 'kit', unit_price: 450000, status: 'AVAILABLE' },
  { sku: 'EST-PISO-GALV', name: 'Estructura Piso Galvanizada (kit 4 paneles)', category: 'Estructuras', stock: 40, min_stock: 8, unit: 'kit', unit_price: 620000, status: 'AVAILABLE' },
  { sku: 'EST-TECHO-TRAP', name: 'Kit Montaje Cubierta Trapezoidal (4 paneles)', category: 'Estructuras', stock: 50, min_stock: 10, unit: 'kit', unit_price: 380000, status: 'AVAILABLE' },

  // Cableado y Eléctrico
  { sku: 'CAB-SOL-6MM', name: 'Cable Solar 6mm² PV1-F (rollo 100m)', category: 'Cableado y Eléctrico', stock: 45, min_stock: 10, unit: 'rollo', unit_price: 320000, status: 'AVAILABLE' },
  { sku: 'CAB-SOL-4MM', name: 'Cable Solar 4mm² PV1-F (rollo 100m)', category: 'Cableado y Eléctrico', stock: 50, min_stock: 10, unit: 'rollo', unit_price: 250000, status: 'AVAILABLE' },
  { sku: 'CONMC4-PAR', name: 'Conectores MC4 (par macho/hembra)', category: 'Cableado y Eléctrico', stock: 500, min_stock: 100, unit: 'par', unit_price: 8500, status: 'AVAILABLE' },
  { sku: 'PROT-DC-2P', name: 'Protección DC Bipolar 600V 32A', category: 'Cableado y Eléctrico', stock: 40, min_stock: 10, unit: 'und', unit_price: 185000, status: 'AVAILABLE' },
  { sku: 'PROT-AC-3P', name: 'Breaker AC Trifásico 40A', category: 'Cableado y Eléctrico', stock: 35, min_stock: 8, unit: 'und', unit_price: 95000, status: 'AVAILABLE' },
  { sku: 'SPD-DC-T2', name: 'Supresor Picos DC Tipo 2 (1000V)', category: 'Cableado y Eléctrico', stock: 30, min_stock: 5, unit: 'und', unit_price: 280000, status: 'AVAILABLE' },
  { sku: 'SPD-AC-T2', name: 'Supresor Picos AC Tipo 2 (275V)', category: 'Cableado y Eléctrico', stock: 30, min_stock: 5, unit: 'und', unit_price: 175000, status: 'AVAILABLE' },
  { sku: 'CAJA-COMB-4', name: 'Caja Combinadora 4 Strings DC', category: 'Cableado y Eléctrico', stock: 20, min_stock: 5, unit: 'und', unit_price: 420000, status: 'AVAILABLE' },
  { sku: 'TIERRA-KIT', name: 'Kit Puesta a Tierra Solar (varilla + cable + conector)', category: 'Cableado y Eléctrico', stock: 35, min_stock: 8, unit: 'kit', unit_price: 145000, status: 'AVAILABLE' },

  // Monitoreo
  { sku: 'MON-WIFI-GROW', name: 'Dongle WiFi Growatt ShineWiFi-X', category: 'Monitoreo', stock: 40, min_stock: 10, unit: 'und', unit_price: 120000, status: 'AVAILABLE' },
  { sku: 'MON-SMART-HUAW', name: 'Smart Dongle Huawei 4G', category: 'Monitoreo', stock: 20, min_stock: 5, unit: 'und', unit_price: 350000, status: 'AVAILABLE' },
  { sku: 'MED-BIDIREC', name: 'Medidor Bidireccional Trifásico DTSU666', category: 'Monitoreo', stock: 25, min_stock: 5, unit: 'und', unit_price: 480000, status: 'AVAILABLE' },

  // Baterías (Opcional)
  { sku: 'BAT-5KWH-LITH', name: 'Batería Litio 5.12 kWh 48V LiFePO4', category: 'Baterías', stock: 12, min_stock: 3, unit: 'und', unit_price: 6800000, status: 'AVAILABLE' },
  { sku: 'BAT-10KWH-LITH', name: 'Batería Litio 10.24 kWh 48V LiFePO4', category: 'Baterías', stock: 8, min_stock: 2, unit: 'und', unit_price: 12500000, status: 'AVAILABLE' },
];

@Injectable()
export class InventoryService implements OnModuleInit {
  private redisSub: Redis;

  constructor(
    @InjectRepository(InventoryItem)
    private repo: Repository<InventoryItem>,
  ) {
    this.redisSub = new Redis();
  }

  async onModuleInit() {
    let inserted = 0;
    for (const item of SEED_DATA) {
      const exists = await this.repo.findOne({ where: { sku: item.sku } });
      if (!exists) {
        await this.repo.save(this.repo.create(item));
        inserted++;
      }
    }
    if (inserted > 0) {
      console.log(`✅ Inventario solar: ${inserted} productos nuevos agregados (total seed: ${SEED_DATA.length})`);
    }

    // Subscribe to inventory deduction events
    this.redisSub.subscribe('inventory.deduct');
    this.redisSub.on('message', async (channel, message) => {
      if (channel === 'inventory.deduct') {
        try {
          const payload = JSON.parse(message);
          if (payload.bom_json) {
            const bom = JSON.parse(payload.bom_json);
            console.log(`[Inventory] Deducting stock for project ${payload.projectId}`);
            for (const item of bom) {
              const invItem = await this.repo.findOne({ where: { sku: item.sku } });
              if (invItem) {
                invItem.stock = Math.max(0, invItem.stock - item.quantity);
                await this.repo.save(invItem);
                console.log(`[Inventory] Deducted ${item.quantity} of ${invItem.sku}`);
              }
            }
          }
        } catch (e) {
          console.error('[Inventory] Error processing deduction', e);
        }
      }
    });
  }

  async deductBom(bomJson: string) {
    if (!bomJson) return { success: false, error: 'No BOM provided' };
    try {
      const bomData = typeof bomJson === 'string' ? JSON.parse(decodeURIComponent(bomJson)) : bomJson;
      const bom = typeof bomData === 'string' ? JSON.parse(bomData) : bomData;
      console.log(`[Inventory HTTP] Deducting stock`);
      for (const item of bom) {
        const invItem = await this.repo.findOne({ where: { sku: item.sku } });
        if (invItem) {
          invItem.stock = Math.max(0, invItem.stock - item.quantity);
          await this.repo.save(invItem);
          console.log(`[Inventory] Deducted ${item.quantity} of ${invItem.sku}`);
        }
      }
      return { success: true };
    } catch (e) {
      console.error('[Inventory] Error parsing HTTP BOM deduction', e);
      return { success: false, error: e.message };
    }
  }

  findAll() {
    return this.repo.find({ order: { category: 'ASC', name: 'ASC' } });
  }

  findByCategory(category: string) {
    return this.repo.find({ where: { category, status: 'AVAILABLE' }, order: { name: 'ASC' } });
  }

  findAvailable() {
    return this.repo.find({ where: { status: 'AVAILABLE' }, order: { category: 'ASC', name: 'ASC' } });
  }

  create(data: Partial<InventoryItem>) {
    const item = this.repo.create(data);
    return this.repo.save(item);
  }

  async addStock(id: number, quantity: number) {
    const item = await this.repo.findOneBy({ id });
    if (!item) throw new Error('Item not found');
    item.stock += quantity;
    return this.repo.save(item);
  }

  async reserveStock(id: number, quantity: number) {
    const item = await this.repo.findOneBy({ id });
    if (!item) throw new Error('Item not found');
    if (item.stock - item.reserved_stock < quantity) {
      throw new Error(`Insufficient available stock for ${item.name}`);
    }
    item.reserved_stock += quantity;
    return this.repo.save(item);
  }

  async releaseStock(id: number, quantity: number) {
    const item = await this.repo.findOneBy({ id });
    if (!item) throw new Error('Item not found');
    item.reserved_stock = Math.max(0, item.reserved_stock - quantity);
    return this.repo.save(item);
  }

  async consumeStock(id: number, quantity: number) {
    // When stock is actually taken out of warehouse
    const item = await this.repo.findOneBy({ id });
    if (!item) throw new Error('Item not found');
    item.stock = Math.max(0, item.stock - quantity);
    item.reserved_stock = Math.max(0, item.reserved_stock - quantity);
    return this.repo.save(item);
  }

  getLowStockAlerts() {
    return this.repo.createQueryBuilder('item')
      .where('(item.stock - item.reserved_stock) <= item.min_stock')
      .orderBy('item.stock - item.reserved_stock', 'ASC')
      .getMany();
  }

  async update(id: number, data: Partial<InventoryItem>) {
    const item = await this.repo.findOneBy({ id });
    if (!item) throw new Error('Item not found');
    Object.assign(item, data);
    return this.repo.save(item);
  }

  async remove(id: number) {
    const item = await this.repo.findOneBy({ id });
    if (!item) throw new Error('Item not found');
    return this.repo.remove(item);
  }
}
