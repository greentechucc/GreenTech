import { Controller, Get, Param, Post, Body, Put, Delete } from '@nestjs/common';
import { PortalService } from './portal.service';

@Controller()
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('users')
  getAllUsers() {
    return this.portalService.getAllUsers();
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.portalService.deleteUser(+id);
  }

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

  @Post('tickets')
  createTicket(@Body() data: any) {
    return this.portalService.createTicket(data);
  }

  @Get('tickets/:customerEmail')
  getTickets(@Param('customerEmail') customerEmail: string) {
    return this.portalService.getTickets(customerEmail);
  }

  @Get('tickets')
  getAllTickets() {
    return this.portalService.getAllTickets();
  }

  @Put('tickets/:id/respond')
  respondTicket(@Param('id') id: string, @Body() body: { resolution: string; assigned_to: string }) {
    return this.portalService.respondTicket(id, body.resolution, body.assigned_to);
  }

  @Put('tickets/:id/close')
  closeTicket(@Param('id') id: string) {
    return this.portalService.closeTicket(id);
  }

  @Get('profile/:email')
  getProfile(@Param('email') email: string) {
    return this.portalService.getProfile(email);
  }

  @Put('profile/contact')
  updateContact(@Body() body: { email: string; phone: string; address: string; name?: string }) {
    return this.portalService.updateContact(body.email, body.phone, body.address, body.name);
  }

  @Put('profile/password')
  updatePassword(@Body() body: { email: string; currentPass: string; newPass: string }) {
    return this.portalService.updatePassword(body.email, body.currentPass, body.newPass);
  }

  @Put('profile/photo')
  updateAvatar(@Body() body: { email: string; avatarDataUrl: string }) {
    return this.portalService.updateAvatar(body.email, body.avatarDataUrl);
  }

  @Post('auth/forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.portalService.forgotPassword(body.email);
  }

  @Post('auth/verify-reset-code')
  verifyResetCode(@Body() body: { email: string; code: string }) {
    return this.portalService.verifyResetCode(body.email, body.code);
  }

  @Post('auth/reset-password')
  resetPassword(@Body() body: { email: string; code: string; newPass: string }) {
    return this.portalService.resetPassword(body.email, body.code, body.newPass);
  }

  @Post('auth/unlock')
  unlockAccount(@Body() body: { token: string }) {
    return this.portalService.unlockAccount(body.token);
  }
}
