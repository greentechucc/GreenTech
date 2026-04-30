import { Controller, Get, Post, Body, Param, Patch, Put, Delete, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get('available')
  findAvailable() {
    return this.inventoryService.findAvailable();
  }

  @Post()
  create(@Body() data: any) {
    return this.inventoryService.create(data);
  }

  @Post('deduct/bom')
  deductBom(@Body() body: { bom_json: string }) {
    return this.inventoryService.deductBom(body.bom_json);
  }

  @Patch(':id/stock')
  addStock(@Param('id') id: string, @Body() body: { quantity: number }) {
    return this.inventoryService.addStock(+id, body.quantity);
  }

  @Get('alerts')
  getAlerts() {
    return this.inventoryService.getLowStockAlerts();
  }

  @Patch(':id/stock/reserve')
  reserveStock(@Param('id') id: string, @Body() body: { quantity: number }) {
    return this.inventoryService.reserveStock(+id, body.quantity);
  }

  @Patch(':id/stock/release')
  releaseStock(@Param('id') id: string, @Body() body: { quantity: number }) {
    return this.inventoryService.releaseStock(+id, body.quantity);
  }

  @Patch(':id/stock/consume')
  consumeStock(@Param('id') id: string, @Body() body: { quantity: number }) {
    return this.inventoryService.consumeStock(+id, body.quantity);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.inventoryService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(+id);
  }
}
