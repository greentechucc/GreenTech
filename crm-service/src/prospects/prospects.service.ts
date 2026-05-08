import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Prospect } from './prospect.entity';
import { Repository } from 'typeorm';
import { redis } from '../redis';
import axios from 'axios';

import { CustomerProfile } from './customer.entity';

@Injectable()
export class ProspectsService {

  constructor(
    @InjectRepository(Prospect)
    private repo: Repository<Prospect>,
    @InjectRepository(CustomerProfile)
    private customerRepo: Repository<CustomerProfile>,
  ) {}

  create(data: Partial<Prospect>) {
    const prospect = this.repo.create(data);
    return this.repo.save(prospect);
  }

  findAll() {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  getCustomers() {
    return this.customerRepo.find({ order: { id: 'DESC' } });
  }

  async update(id: number, data: Partial<Prospect>) {
    const prospect = await this.repo.findOneBy({ id });
    if (!prospect) return null;

    if (data.name !== undefined) prospect.name = data.name;
    if (data.email !== undefined) prospect.email = data.email;
    if (data.phone !== undefined) prospect.phone = data.phone;
    if (data.consumption !== undefined) prospect.consumption = data.consumption;
    if (data.status !== undefined) prospect.status = data.status;
    if (data.source !== undefined) prospect.source = data.source;
    if (data.assigned_rep !== undefined) prospect.assigned_rep = data.assigned_rep;

    return this.repo.save(prospect);
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }

  // 🔥 MÉTODO COMPLETO (PROFESIONAL)
  async convertToCustomer(id: number) {
    const prospect = await this.repo.findOneBy({ id });

    if (!prospect) {
      throw new Error('Prospecto no encontrado');
    }

    // ✅ 1. Cambiar estado
    prospect.status = 'WON';
    await this.repo.save(prospect);

    // ✅ 2. Generar Customer Profile
    let customer = await this.customerRepo.findOneBy({ email: prospect.email });
    if (!customer) {
      customer = this.customerRepo.create({
        name: prospect.name,
        email: prospect.email,
        phone: prospect.phone,
        assigned_rep: prospect.assigned_rep || 'Sin asignar',
        consumption_type: 'Pendiente',
        address: 'No especificada',
      });
      await this.customerRepo.save(customer);
    }

    // ✅ 3. Publicar evento en Redis (si está disponible)
    if (redis) {
      await redis.publish('prospect.converted', JSON.stringify({
        id: prospect.id,
        name: prospect.name,
        email: prospect.email,
      }));
    }

    // ✅ 4. Respuesta completa
    return {
      prospect,
      cotizacion: null,
    };
  }
}