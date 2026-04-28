import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerUser } from './customer-user.entity';
import { Ticket } from './ticket.entity';
import { Repository } from 'typeorm';
import { MailService } from './mail.service';
import axios from 'axios';

@Injectable()
export class PortalService {
  private readonly PROJECT_API = 'http://localhost:3003';
  private readonly MONITORING_API = 'http://localhost:3007';
  private readonly BILLING_API = 'http://localhost:3008';

  constructor(
    @InjectRepository(CustomerUser)
    private userRepo: Repository<CustomerUser>,
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,
    private mailService: MailService,
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

    // Enviar correo de bienvenida (no bloquea la respuesta)
    this.mailService.sendWelcomeEmail(saved.email, saved.name).catch(() => {});

    return { success: true, email: saved.email, name: saved.name };
  }

  async getAllUsers() {
    return this.userRepo.find({
      select: ['id', 'email', 'name', 'phone', 'address', 'failed_login_attempts', 'login_locked_until', 'created_at']
    });
  }

  async deleteUser(id: number) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new HttpException('Cliente no encontrado', HttpStatus.NOT_FOUND);
    }
    await this.userRepo.remove(user);
    return { success: true, message: 'Cliente eliminado permanentemente' };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOneBy({ email });
    if (!user) {
      throw new HttpException('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
    }

    if (user.login_locked_until && new Date() < new Date(user.login_locked_until)) {
      const waitMins = Math.ceil((new Date(user.login_locked_until).getTime() - new Date().getTime()) / 60000);
      throw new HttpException(`Cuenta bloqueada por seguridad. Revisa tu correo o intenta en ${waitMins} minutos.`, HttpStatus.FORBIDDEN);
    }

    if (user.password_hash !== password) {
      user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;
      if (user.failed_login_attempts >= 3) {
        const lockTime = new Date();
        lockTime.setHours(lockTime.getHours() + 1);
        user.login_locked_until = lockTime;
        
        // Generate Unlock Token and sent Alert
        const token = require('crypto').randomUUID();
        user.unlock_token = token;
        await this.userRepo.save(user);

        this.mailService.sendSecurityAlertEmail(email, user.name, token).catch(() => {});
        
        throw new HttpException(`Demasiados intentos fallidos. Te hemos enviado un correo para desbloquear tu cuenta.`, HttpStatus.FORBIDDEN);
      }
      await this.userRepo.save(user);
      throw new HttpException(`Credenciales inválidas. Intento ${user.failed_login_attempts}/3 antes de bloqueo.`, HttpStatus.UNAUTHORIZED);
    }

    user.failed_login_attempts = 0;
    user.login_locked_until = null as any;
    user.unlock_token = null as any;
    await this.userRepo.save(user);

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

  async createTicket(data: any) {
    if (!data.customer_email || !data.subject || !data.description) {
      throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
    }
    const ticket = this.ticketRepo.create({
      customer_email: data.customer_email,
      subject: data.subject,
      description: data.description,
      status: 'OPEN',
      created_at: new Date()
    });
    return this.ticketRepo.save(ticket);
  }

  async getTickets(customerEmail: string) {
    return this.ticketRepo.find({
      where: { customer_email: customerEmail },
      order: { created_at: 'DESC' }
    });
  }

  async getAllTickets() {
    return this.ticketRepo.find({ order: { created_at: 'DESC' } });
  }

  async respondTicket(id: string, resolution: string, assignedTo: string) {
    const ticket = await this.ticketRepo.findOneBy({ id });
    if (!ticket) throw new HttpException('Ticket no encontrado', HttpStatus.NOT_FOUND);
    ticket.resolution = resolution;
    ticket.assigned_to = assignedTo;
    ticket.status = 'IN_PROGRESS';
    return this.ticketRepo.save(ticket);
  }

  async closeTicket(id: string) {
    const ticket = await this.ticketRepo.findOneBy({ id });
    if (!ticket) throw new HttpException('Ticket no encontrado', HttpStatus.NOT_FOUND);
    ticket.status = 'CLOSED';
    ticket.resolved_at = new Date();
    return this.ticketRepo.save(ticket);
  }

  async getProfile(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return {
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      avatar_url: user.avatar_url
    };
  }

  async updateContact(email: string, phone: string, address: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    user.phone = phone;
    user.address = address;
    await this.userRepo.save(user);
    return { success: true };
  }

  async updatePassword(email: string, currentPass: string, newPass: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    if (user.password_hash !== currentPass) {
       throw new HttpException('Contraseña actual inválida', HttpStatus.BAD_REQUEST);
    }
    user.password_hash = newPass;
    await this.userRepo.save(user);
    return { success: true };
  }

  async updateAvatar(email: string, avatarDataUrl: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    user.avatar_url = avatarDataUrl;
    await this.userRepo.save(user);
    return { success: true };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      this.mailService.sendNoAccountEmail(email).catch(() => {});
      throw new HttpException('Este correo no tiene cuenta asociada.', HttpStatus.NOT_FOUND);
    }

    if (user.reset_locked_until && new Date() < new Date(user.reset_locked_until)) {
      const waitMins = Math.ceil((new Date(user.reset_locked_until).getTime() - new Date().getTime()) / 60000);
      throw new HttpException(`Recuperación bloqueada térmporalmente. Intente en ${waitMins} minutos.`, HttpStatus.FORBIDDEN);
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    user.reset_code = code;
    user.reset_expires_at = expiresAt;
    await this.userRepo.save(user);

    this.mailService.sendResetEmail(email, code, user.name).catch(() => {});
    return { success: true };
  }

  async verifyResetCode(email: string, code: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('Petición inválida', HttpStatus.BAD_REQUEST);
    }

    if (user.reset_locked_until && new Date() < new Date(user.reset_locked_until)) {
      const waitMins = Math.ceil((new Date(user.reset_locked_until).getTime() - new Date().getTime()) / 60000);
      throw new HttpException(`Recuperación bloqueada temporalmente. Intente en ${waitMins} minutos.`, HttpStatus.FORBIDDEN);
    }

    if (user.reset_code !== code) {
      user.failed_reset_attempts = (user.failed_reset_attempts || 0) + 1;
      if (user.failed_reset_attempts >= 3) {
        const lockTime = new Date();
        lockTime.setHours(lockTime.getHours() + 1);
        user.reset_locked_until = lockTime;
        await this.userRepo.save(user);
        throw new HttpException(`Demasiados intentos fallidos. Recuperación bloqueada por 1 hora.`, HttpStatus.FORBIDDEN);
      }
      await this.userRepo.save(user);
      throw new HttpException(`Código de seguridad incorrecto. Intento ${user.failed_reset_attempts}/3`, HttpStatus.BAD_REQUEST);
    }

    if (new Date() > new Date(user.reset_expires_at)) {
       throw new HttpException('El código de seguridad ha expirado', HttpStatus.BAD_REQUEST);
    }

    return { success: true };
  }

  async resetPassword(email: string, code: string, newPass: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || user.reset_code !== code || new Date() > new Date(user.reset_expires_at)) {
      throw new HttpException('Petición de restablecimiento inválida o expirada', HttpStatus.BAD_REQUEST);
    }

    user.password_hash = newPass;
    user.reset_code = null as any;
    user.reset_expires_at = null as any;
    // Clearing reset lockouts 
    user.failed_reset_attempts = 0;
    user.reset_locked_until = null as any;
    await this.userRepo.save(user);

    return { success: true };
  }

  async unlockAccount(token: string) {
    const user = await this.userRepo.findOne({ where: { unlock_token: token } });
    if (!user) {
      throw new HttpException('Enlace inválido o expirado.', HttpStatus.BAD_REQUEST);
    }

    user.failed_login_attempts = 0;
    user.login_locked_until = null as any;
    user.failed_reset_attempts = 0;
    user.reset_locked_until = null as any;
    user.unlock_token = null as any;

    await this.userRepo.save(user);
    return { success: true };
  }
}
