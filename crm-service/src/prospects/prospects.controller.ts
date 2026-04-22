import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ProspectsService } from './prospects.service';

@Controller('prospects')
export class ProspectsController {

  constructor(private service: ProspectsService) {}

  @Post()
  create(@Body() body: any) {
    console.log('BODY RECIBIDO:', body);
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post('convert/:id')
  convert(@Param('id') id: string) {
    return this.service.convertToCustomer(Number(id));
  }

  @Get('customers')
  getCustomers() {
    return this.service.getCustomers();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}