import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { StaffUser } from './staff-user.entity';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(StaffUser)
    private userRepo: Repository<StaffUser>,
    private jwtService: JwtService,
  ) {}

  // Seed initial staff users on first startup
  async onModuleInit() {
    const count = await this.userRepo.count();
    if (count === 0) {
      const defaultUsers = [
        { name: 'Administrador GreenTech', email: 'admin@greentech.com', password: '12345', role: 'Admin' },
        { name: 'Carlos Ventas', email: 'asesor.ventas@greentech.com', password: '12345', role: 'Asesor' },
        { name: 'María Proyectos', email: 'proyectos@greentech.com', password: '12345', role: 'Proyectos' },
        { name: 'Juan Bodega', email: 'bodega@greentech.com', password: '12345', role: 'Bodega' },
        { name: 'Pedro Técnico', email: 'tecnico@greentech.com', password: '12345', role: 'Tecnico' },
        { name: 'Laura Soporte', email: 'soporte@greentech.com', password: '12345', role: 'Soporte' },
      ];

      for (const u of defaultUsers) {
        const hash = await bcrypt.hash(u.password, 10);
        await this.userRepo.save(this.userRepo.create({
          name: u.name,
          email: u.email,
          password_hash: hash,
          role: u.role,
          active: true,
        }));
      }
      console.log('[Auth] Seeded 6 default staff users');
    }
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOneBy({ email });
    if (!user || !user.active) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepo.findOneBy({ id: payload.sub });
      if (!user || !user.active) {
        throw new UnauthorizedException('Token inválido');
      }

      const newPayload = { sub: user.id, email: user.email, role: user.role, name: user.name };
      return {
        access_token: this.jwtService.sign(newPayload, { expiresIn: '15m' }),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  async getStaffUsers() {
    return this.userRepo.find({
      select: ['id', 'name', 'email', 'role', 'active', 'created_at'],
    });
  }

  async createStaffUser(data: { name: string; email: string; password: string; role: string }) {
    const hash = await bcrypt.hash(data.password, 10);
    const user = this.userRepo.create({
      name: data.name,
      email: data.email,
      password_hash: hash,
      role: data.role,
      active: true,
    });
    const saved = await this.userRepo.save(user);
    return { id: saved.id, name: saved.name, email: saved.email, role: saved.role };
  }

  async updateStaffUser(id: number, data: Partial<{ name: string; email: string; password: string; role: string; active: boolean }>) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    if (data.name !== undefined) user.name = data.name;
    if (data.email !== undefined) user.email = data.email;
    if (data.role !== undefined) user.role = data.role;
    if (data.active !== undefined) user.active = data.active;
    if (data.password) user.password_hash = await bcrypt.hash(data.password, 10);
    await this.userRepo.save(user);
    return { id: user.id, name: user.name, email: user.email, role: user.role, active: user.active };
  }

  async deleteStaffUser(id: number) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    await this.userRepo.remove(user);
    return { success: true };
  }
}
