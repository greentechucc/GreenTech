import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Quotation } from './quotation.entity';
import { InventoryItem } from '../inventory/inventory.entity';
import { Repository } from 'typeorm';

interface BomLine {
  sku: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price: number;
  subtotal: number;
}

@Injectable()
export class QuotationService {

  constructor(
    @InjectRepository(Quotation)
    private repo: Repository<Quotation>,
    @InjectRepository(InventoryItem)
    private inventoryRepo: Repository<InventoryItem>,
  ) {}

  /**
   * Genera automáticamente el BOM (lista de materiales) basándose en
   * el consumo mensual en kWh y los precios reales del inventario.
   */
  private async generateBom(consumo: number): Promise<{ bom: BomLine[], system_size_kwp: number, panel_count: number, total: number, discount_applied: number, roi_years: number, co2_saved_tons: number, financing_options: string }> {
    const produccionPorKw = 120; // kWh/mes por kWp (promedio Colombia)
    const system_size_kwp = consumo / produccionPorKw;

    // Obtener inventario disponible
    const items = await this.inventoryRepo.find({ where: { status: 'AVAILABLE' }, order: { unit_price: 'ASC' } });

    const findByCategory = (cat: string) => items.filter(i => i.category === cat);
    const bom: BomLine[] = [];

    // 1. PANELES - seleccionar el modelo más económico disponible
    const paneles = findByCategory('Paneles Solares');
    const panel = paneles.length > 0 ? paneles[0] : null;
    const panel_power = panel ? parseFloat(panel.sku.match(/(\d+)W/)?.[1] || '550') / 1000 : 0.55;
    const panel_count = Math.ceil(system_size_kwp / panel_power);

    if (panel) {
      bom.push({
        sku: panel.sku, name: panel.name, category: panel.category,
        quantity: panel_count, unit: panel.unit,
        unit_price: panel.unit_price, subtotal: panel.unit_price * panel_count,
      });
    }

    // 2. INVERSOR - seleccionar el inversor adecuado al tamaño del sistema
    const inversores = findByCategory('Inversores').sort((a, b) => {
      const kwA = parseFloat(a.sku.match(/(\d+)KW/i)?.[1] || a.name.match(/(\d+)\s*kW/i)?.[1] || '0');
      const kwB = parseFloat(b.sku.match(/(\d+)KW/i)?.[1] || b.name.match(/(\d+)\s*kW/i)?.[1] || '0');
      return kwA - kwB;
    });

    let inversorQty = 1;
    let selectedInversor = inversores.find(inv => {
      const kwInv = parseFloat(inv.sku.match(/(\d+)KW/i)?.[1] || inv.name.match(/(\d+)\s*kW/i)?.[1] || '0');
      return kwInv >= system_size_kwp;
    });

    if (!selectedInversor && inversores.length > 0) {
      // Si el sistema es mayor que el inversor más grande, usar múltiples
      const largest = inversores[inversores.length - 1];
      const kwLargest = parseFloat(largest.sku.match(/(\d+)KW/i)?.[1] || largest.name.match(/(\d+)\s*kW/i)?.[1] || '50');
      inversorQty = Math.ceil(system_size_kwp / kwLargest);
      selectedInversor = largest;
    }

    if (selectedInversor) {
      bom.push({
        sku: selectedInversor.sku, name: selectedInversor.name, category: selectedInversor.category,
        quantity: inversorQty, unit: selectedInversor.unit,
        unit_price: selectedInversor.unit_price, subtotal: selectedInversor.unit_price * inversorQty,
      });
    }

    // 3. ESTRUCTURAS - kits de 4 paneles
    const estructuras = findByCategory('Estructuras');
    const estructura = estructuras.length > 0 ? estructuras[0] : null;
    const kitsPaneles = Math.ceil(panel_count / 4);
    if (estructura) {
      bom.push({
        sku: estructura.sku, name: estructura.name, category: estructura.category,
        quantity: kitsPaneles, unit: estructura.unit,
        unit_price: estructura.unit_price, subtotal: estructura.unit_price * kitsPaneles,
      });
    }

    // 4. CABLEADO SOLAR - 1 rollo cada 8 paneles
    const cables = items.filter(i => i.sku === 'CAB-SOL-6MM');
    if (cables.length > 0) {
      const rollos = Math.ceil(panel_count / 8);
      bom.push({
        sku: cables[0].sku, name: cables[0].name, category: cables[0].category,
        quantity: rollos, unit: cables[0].unit,
        unit_price: cables[0].unit_price, subtotal: cables[0].unit_price * rollos,
      });
    }

    // 5. CONECTORES MC4 - 2 pares por panel
    const mc4 = items.filter(i => i.sku === 'CONMC4-PAR');
    if (mc4.length > 0) {
      const pares = panel_count * 2;
      bom.push({
        sku: mc4[0].sku, name: mc4[0].name, category: mc4[0].category,
        quantity: pares, unit: mc4[0].unit,
        unit_price: mc4[0].unit_price, subtotal: mc4[0].unit_price * pares,
      });
    }

    // 6. PROTECCIÓN DC - 1 por cada string de 8 paneles
    const protDC = items.filter(i => i.sku === 'PROT-DC-2P');
    if (protDC.length > 0) {
      const qty = Math.ceil(panel_count / 8);
      bom.push({
        sku: protDC[0].sku, name: protDC[0].name, category: protDC[0].category,
        quantity: qty, unit: protDC[0].unit,
        unit_price: protDC[0].unit_price, subtotal: protDC[0].unit_price * qty,
      });
    }

    // 7. PROTECCIÓN AC - 1 por inversor
    const protAC = items.filter(i => i.sku === 'PROT-AC-3P');
    if (protAC.length > 0) {
      bom.push({
        sku: protAC[0].sku, name: protAC[0].name, category: protAC[0].category,
        quantity: inversorQty, unit: protAC[0].unit,
        unit_price: protAC[0].unit_price, subtotal: protAC[0].unit_price * inversorQty,
      });
    }

    // 8. SUPRESORES DC y AC - 1 de cada uno
    for (const sku of ['SPD-DC-T2', 'SPD-AC-T2']) {
      const item = items.find(i => i.sku === sku);
      if (item) {
        bom.push({
          sku: item.sku, name: item.name, category: item.category,
          quantity: 1, unit: item.unit,
          unit_price: item.unit_price, subtotal: item.unit_price,
        });
      }
    }

    // 9. KIT PUESTA A TIERRA - 1
    const tierra = items.find(i => i.sku === 'TIERRA-KIT');
    if (tierra) {
      bom.push({
        sku: tierra.sku, name: tierra.name, category: tierra.category,
        quantity: 1, unit: tierra.unit,
        unit_price: tierra.unit_price, subtotal: tierra.unit_price,
      });
    }

    // 10. MONITOREO - Un dongle WiFi
    const monitoreo = items.find(i => i.category === 'Monitoreo' && i.status === 'AVAILABLE');
    if (monitoreo) {
      bom.push({
        sku: monitoreo.sku, name: monitoreo.name, category: monitoreo.category,
        quantity: 1, unit: monitoreo.unit,
        unit_price: monitoreo.unit_price, subtotal: monitoreo.unit_price,
      });
    }

    let total = bom.reduce((sum, line) => sum + line.subtotal, 0);

    // Regla de Negocio: 5% de descuento al por mayor para sistemas de gran escala (>100 kWp)
    let discount_applied = 0;
    if (system_size_kwp > 100) {
      discount_applied = total * 0.05;
      total = total - discount_applied;
    }

    // Cálculo de ROI y Ahorros
    const tarifa_energia = 900; // COP por kWh estimado
    const produccionAnualKwh = system_size_kwp * 120 * 12;
    const ahorroAnual = produccionAnualKwh * tarifa_energia;
    const roi_years = parseFloat((total / ahorroAnual).toFixed(2));

    // CO2 Mitigado (Aprox 0.4 kg de CO2 por kWh)
    const co2_saved_tons = parseFloat(((produccionAnualKwh * 0.4) / 1000).toFixed(2));

    // Escenarios de Financiamiento
    const financing_options = JSON.stringify({
       contado: total,
       credito_5_anios_mensual: parseFloat((total * 1.3 / 60).toFixed(0)),
       leasing_10_anios_mensual: parseFloat((total * 1.5 / 120).toFixed(0))
    });

    return { bom, system_size_kwp, panel_count, total, discount_applied, roi_years, co2_saved_tons, financing_options };
  }

  async crearCotizacion(data: any) {
    const consumo = data.consumo;
    const { bom, system_size_kwp, panel_count, total, discount_applied, roi_years, co2_saved_tons, financing_options } = await this.generateBom(consumo);

    const quotation = this.repo.create({
      customer_name: data.customer_name,
      consumo_kwh: consumo,
      system_size_kwp,
      panel_count,
      total_price: total,
      discount_applied,
      roi_years,
      co2_saved_tons,
      financing_options,
      bom_json: JSON.stringify(bom),
    });

    return this.repo.save(quotation);
  }

  findAll() {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async update(id: number, data: any) {
    const quotation = await this.repo.findOneBy({ id });
    if (!quotation) return null;

    if (data.customer_name) quotation.customer_name = data.customer_name;
    if (data.status) quotation.status = data.status;
    
    if (data.consumo) {
      const { bom, system_size_kwp, panel_count, total, discount_applied, roi_years, co2_saved_tons, financing_options } = await this.generateBom(data.consumo);
      quotation.consumo_kwh = data.consumo;
      quotation.system_size_kwp = system_size_kwp;
      quotation.panel_count = panel_count;
      quotation.total_price = total;
      quotation.discount_applied = discount_applied;
      quotation.roi_years = roi_years;
      quotation.co2_saved_tons = co2_saved_tons;
      quotation.financing_options = financing_options;
      quotation.bom_json = JSON.stringify(bom);
    }

    return this.repo.save(quotation);
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }
}