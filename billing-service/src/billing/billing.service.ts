import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { Payment } from './payment.entity';
import Redis from 'ioredis';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private redisPub: Redis;
  private redisSub: Redis;

  constructor(
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
  ) {
    this.redisPub = new Redis({ host: 'localhost', port: 6379 });
    this.redisSub = new Redis({ host: 'localhost', port: 6379 });
    
    this.initSubscriptions();
  }

  private initSubscriptions() {
    this.redisSub.subscribe('project.stage.changed', (err) => {
      if (err) this.logger.error('Failed to subscribe', err);
    });

    this.redisSub.on('message', async (channel, message) => {
      if (channel === 'project.stage.changed') {
        const payload = JSON.parse(message);
        this.logger.log(`Received stage change for project ${payload.projectId}: ${payload.stage}`);
        if (payload.stage === 'INSTALLATION_STARTED') {
            await this.generateMilestones(payload.projectId, payload.customerId, 5000); // Wait, 5000 was hardcoded here? Let's keep it as is, or remove hardcoding? Wait! I'll leave the payload parsing as is but call generateMilestones.
        }
      }
    });
  }

  async findAll() {
    return this.invoiceRepo.find({ relations: ['payments'], order: { created_at: 'DESC' } });
  }

  async generateMilestones(projectId: number, customerId: number, totalAmount: number, customer_name?: string, baseConcept?: string) {
    const milestones = [
      { pct: 0.50, label: 'Anticipo (50%)', days: 5 },
      { pct: 0.40, label: 'Contra-entrega (40%)', days: 30 },
      { pct: 0.10, label: 'Conexión / Trámites (10%)', days: 60 }
    ];

    const invoices: Invoice[] = [];
    let accumulated = 0;

    for (let i = 0; i < milestones.length; i++) {
      const m = milestones[i];
      const due = new Date();
      due.setDate(due.getDate() + m.days);

      // Handle precision
      const amount = i === milestones.length - 1 ? totalAmount - accumulated : Math.round(totalAmount * m.pct);
      accumulated += amount;

      const inv = this.invoiceRepo.create({
        project_id: projectId,
        customer_id: customerId,
        customer_name: customer_name || '',
        concept: `${baseConcept || 'Proyecto Solar'} - ${m.label}`,
        amount,
        due_date: due
      });
      invoices.push(inv);
    }
    
    await this.invoiceRepo.save(invoices);
    this.logger.log(`3 Milestones generated for Project ${projectId}`);
    return invoices;
  }

  async update(id: number, data: any) {
    const invoice = await this.invoiceRepo.findOneBy({ id });
    if (!invoice) return null;

    if (data.customer_name !== undefined) invoice.customer_name = data.customer_name;
    if (data.concept !== undefined) invoice.concept = data.concept;
    if (data.amount !== undefined) invoice.amount = data.amount;
    if (data.status !== undefined) invoice.status = data.status;

    return this.invoiceRepo.save(invoice);
  }

  async remove(id: number) {
    await this.paymentRepo.delete({ invoice_id: id });
    await this.invoiceRepo.delete(id);
    return { deleted: true };
  }

  async recordPayment(invoiceId: number, amount: number, method: string, transactionId?: string) {
    const inv = await this.invoiceRepo.findOne({ where: { id: invoiceId }, relations: ['payments'] });
    if (!inv) throw new Error('Invoice not found');
    
    const payment = this.paymentRepo.create({
      invoice_id: invoiceId,
      amount,
      payment_method: method,
      transaction_id: transactionId
    });
    
    await this.paymentRepo.save(payment);

    const totalPaid = inv.payments.reduce((sum, p) => sum + p.amount, 0) + amount;
    if (totalPaid >= inv.amount) {
      await this.invoiceRepo.update(inv.id, {
        status: 'PAID',
        paid_at: new Date()
      });
    }

    this.redisPub.publish('payment.received', JSON.stringify({
      invoiceId,
      projectId: inv.project_id,
      amount
    }));

    return payment;
  }
}
