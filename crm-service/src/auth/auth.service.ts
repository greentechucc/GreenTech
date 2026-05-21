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

    // Asegurar que los auxiliares existan
    const hasAux = await this.userRepo.findOneBy({ email: 'aux1.alfa@greentech.com' });
    if (!hasAux) {
       const newUsers = [
          { name: 'Jefe Alfa (Norte)', email: 'tecnicocuadrillanorte@greentech.com', password: '12345', role: 'Tecnico', crew_name: 'Cuadrilla Alfa (Norte)' },
          { name: 'Jefe Beta (Sur)', email: 'tecnicocuadrillasur@greentech.com', password: '12345', role: 'Tecnico', crew_name: 'Cuadrilla Beta (Sur)' },
          { name: 'Jefe Omega (Centro)', email: 'tecnicocuadrillacentro@greentech.com', password: '12345', role: 'Tecnico', crew_name: 'Cuadrilla Omega (Centro)' },
          { name: 'Jefe Subcontratista', email: 'tecnicosubcontratista@greentech.com', password: '12345', role: 'Tecnico', crew_name: 'Subcontratista Energía Global' }
       ];
       
       const cuadrillas = ['Cuadrilla Alfa (Norte)', 'Cuadrilla Beta (Sur)', 'Cuadrilla Omega (Centro)', 'Subcontratista Energía Global'];
       const prefixes = ['alfa', 'beta', 'omega', 'sub'];
       let auxCounter = 1;
       
       for (let c = 0; c < 4; c++) {
         for (let i = 1; i <= 5; i++) {
            newUsers.push({
               name: `Auxiliar ${auxCounter} (${cuadrillas[c]})`,
               email: `aux${i}.${prefixes[c]}@greentech.com`,
               password: '12345',
               role: 'Auxiliar',
               crew_name: cuadrillas[c]
            });
            auxCounter++;
         }
       }

       for (const u of newUsers) {
         const exists = await this.userRepo.findOneBy({ email: u.email });
         if (!exists) {
           const hash = await bcrypt.hash(u.password, 10);
           await this.userRepo.save(this.userRepo.create({
             name: u.name,
             email: u.email,
             password_hash: hash,
             role: u.role,
             crew_name: u.crew_name,
             active: true,
           }));
         } else if (!exists.crew_name && u.crew_name) {
           exists.crew_name = u.crew_name;
           await this.userRepo.save(exists);
         }
       }
       
       const oldTecnico = await this.userRepo.findOneBy({ email: 'tecnico@greentech.com' });
       if (oldTecnico) {
          await this.userRepo.remove(oldTecnico);
       }
       console.log('[Auth] Creamos Cuadrillas (Jefes y Auxiliares) en la BD');
    }
    
    // Auto-patch Jefes que se hayan creado antes sin crew_name
    await this.userRepo.update({ email: 'tecnicocuadrillanorte@greentech.com' }, { crew_name: 'Cuadrilla Alfa (Norte)' });
    await this.userRepo.update({ email: 'tecnicocuadrillasur@greentech.com' }, { crew_name: 'Cuadrilla Beta (Sur)' });
    await this.userRepo.update({ email: 'tecnicocuadrillacentro@greentech.com' }, { crew_name: 'Cuadrilla Omega (Centro)' });
    await this.userRepo.update({ email: 'tecnicosubcontratista@greentech.com' }, { crew_name: 'Subcontratista Energía Global' });

    // Asegurar que Analista Facturas exista en la BD (Producción/Render local)
    const hasFacturas = await this.userRepo.findOneBy({ email: 'facturas@greentech.com' });
    if (!hasFacturas) {
      const hash = await bcrypt.hash('12345', 10);
      await this.userRepo.save(this.userRepo.create({
        name: 'Analista Facturas',
        email: 'facturas@greentech.com',
        password_hash: hash,
        role: 'Facturas',
        active: true,
      }));
      console.log('[Auth] Insertado usuario Analista Facturas en la base de datos.');
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
        crew_name: user.crew_name,
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
          crew_name: user.crew_name,
        },
      };
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  async getStaffUsers() {
    return this.userRepo.find({
      select: ['id', 'name', 'email', 'role', 'active', 'crew_name', 'created_at'],
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
