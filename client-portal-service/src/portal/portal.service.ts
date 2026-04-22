import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerUser } from './customer-user.entity';
import { Repository } from 'typeorm';
import axios from 'axios';

@Injectable()
export class PortalService {
  private readonly PROJECT_API = 'http://localhost:3003';
  private readonly MONITORING_API = 'http://localhost:3007';
  private readonly BILLING_API = 'http://localhost:3008';

  constructor(
    @InjectRepository(CustomerUser)
    private userRepo: Repository<CustomerUser>,
  ) {}

  async register(data: any) {
    const existing = await this.userRepo.findOneBy({ email: data.email });
    if (existing) {
      throw new HttpException('Email already registered', HttpStatus.BAD_REQUEST);
    }
    const user = this.userRepo.create({
      name: data.name,
      email: data.email,
      password_hash: data.password, // In a real app, hash this
    });
    const saved = await this.userRepo.save(user);
    return { success: true, email: saved.email, name: saved.name };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOneBy({ email });
    if (!user || user.password_hash !== password) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return { success: true, email: user.email, name: user.name };
  }

  async getCustomerDashboard(customerEmail: string) {
    try {
      // 1. Obtener proyectos del cliente a través del API Gateway o directamente
      let projects: any[] = [];
      try {
        const { data } = await axios.get(`${this.PROJECT_API}/projects`);
        projects = data.filter((p: any) => p.customer_email === customerEmail || p.customer_name === customerEmail);
      } catch (e) {
        console.warn('Failed to fetch projects for portal', e.message);
      }

      if (projects.length === 0) {
        return {
          customer_email: customerEmail,
          projects: [],
          telemetry: null
        };
      }

      const activeProject = projects[0];

      let telemetry: any = null;
      try {
        const { data } = await axios.get(`${this.MONITORING_API}/monitoring/savings/project/${activeProject.id}`);
        telemetry = data;
      } catch (e) {
        telemetry = { saved_kwh: 0, savings_cop: 0, period: '24h' };
      }

      let invoices: any = [];
      try {
        const { data } = await axios.get(`${this.BILLING_API}/billing/invoices`);
        invoices = data.filter((i: any) => i.project_id === activeProject.id || i.customer_name === customerEmail || i.customer_name === activeProject.customer_name);
      } catch (e) {
        console.warn('Failed to fetch invoices for portal');
      }

      return {
        customer_email: customerEmail,
        projects,
        telemetry,
        invoices
      };
    } catch (e) {
      throw new HttpException('Error fetching portal data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
