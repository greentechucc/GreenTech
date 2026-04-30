import { Controller, Post, Body, Get, Put, Delete, Param } from '@nestjs/common';
import { QuotationService } from './quotation.service';

@Controller('quotation')
export class QuotationController {

  constructor(private service: QuotationService) {}

  // 🔹 Crear y guardar
  @Post()
  crear(@Body() body: any) {
    return this.service.crearCotizacion(body);
  }

  // 🔹 Ver todas
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(Number(id), body);
  }

  @Post(':id/send-email')
  sendEmail(@Param('id') id: string) {
    return this.service.sendEmail(Number(id));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}