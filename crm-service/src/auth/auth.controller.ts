import { Controller, Post, Body, Get, Put, Delete, Param } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('refresh')
  refresh(@Body() body: { refresh_token: string }) {
    return this.authService.refresh(body.refresh_token);
  }

  @Get('staff')
  getStaffUsers() {
    return this.authService.getStaffUsers();
  }

  @Post('staff')
  createStaffUser(@Body() body: { name: string; email: string; password: string; role: string }) {
    return this.authService.createStaffUser(body);
  }

  @Put('staff/:id')
  updateStaffUser(@Param('id') id: string, @Body() body: any) {
    return this.authService.updateStaffUser(+id, body);
  }

  @Delete('staff/:id')
  deleteStaffUser(@Param('id') id: string) {
    return this.authService.deleteStaffUser(+id);
  }
}
