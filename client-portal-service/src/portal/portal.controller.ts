import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { PortalService } from './portal.service';

@Controller()
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Post('auth/register')
  register(@Body() data: any) {
    return this.portalService.register(data);
  }

  @Post('auth/login')
  login(@Body() credentials: any) {
    return this.portalService.login(credentials.email, credentials.password);
  }

  @Get('dashboard/:customerEmail')
  getDashboard(@Param('customerEmail') customerEmail: string) {
    return this.portalService.getCustomerDashboard(customerEmail);
  }
}
