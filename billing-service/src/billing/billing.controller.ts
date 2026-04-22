import { Controller, Post, Body, Param, Get, Put, Delete } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('invoices')
  findAll() {
    return this.billingService.findAll();
  }

  @Post('invoice')
  createInvoice(@Body() data: { projectId: number, customerId: number, amount: number, concept?: string, customer_name?: string }) {
    return this.billingService.generateMilestones(data.projectId, data.customerId, data.amount, data.customer_name, data.concept);
  }

  @Post('invoice/:id/payment-link')
  generatePaymentLink(@Param('id') invoiceId: string) {
    // Simular integración con MercadoPago / Stripe
    const mockProviders = ['MercadoPago', 'Stripe'];
    const provider = mockProviders[Math.floor(Math.random() * mockProviders.length)];
    const id = Math.random().toString(36).substring(2, 15);
    return { 
      link: `https://checkout.${provider.toLowerCase()}.com/pay/${id}`,
      provider,
      expires_in: '24h'
    };
  }

  @Post(':id/pay')
  recordPayment(
    @Param('id') invoiceId: string, 
    @Body() data: { amount: number, method: string, transactionId?: string }
  ) {
    return this.billingService.recordPayment(+invoiceId, data.amount, data.method, data.transactionId);
  }

  @Put('invoices/:id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.billingService.update(Number(id), body);
  }

  @Delete('invoices/:id')
  remove(@Param('id') id: string) {
    return this.billingService.remove(Number(id));
  }
}
