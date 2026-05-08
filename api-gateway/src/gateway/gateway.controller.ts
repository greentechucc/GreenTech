import { Controller, All, Req, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import axios from 'axios';
import type { Request, Response } from 'express';

@Controller()
export class GatewayController {

  private createProxy(targetUrl: string, prefixToRemove: string) {
    return async (req: Request, res: Response) => {
      try {
        const targetPath = req.path.replace(new RegExp(`^${prefixToRemove}`), '');

        // Build safe headers — strip any client-supplied x-user-* headers (prevent spoofing)
        const forwardHeaders: Record<string, string> = {};
        if (req.headers['content-type']) forwardHeaders['content-type'] = req.headers['content-type'] as string;
        if (req.headers['accept']) forwardHeaders['accept'] = req.headers['accept'] as string;

        // Inject authenticated user info from JWT (set by JwtAuthGuard)
        const user = (req as any)['user'];
        if (user) {
          forwardHeaders['x-user-id'] = String(user.userId);
          forwardHeaders['x-user-email'] = user.email;
          forwardHeaders['x-user-role'] = user.role;
          forwardHeaders['x-user-name'] = user.name || '';
        }

        const response = await axios({
          method: req.method as any,
          url: `${targetUrl}${targetPath}`,
          data: ['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase()) ? req.body : undefined,
          headers: forwardHeaders,
          validateStatus: () => true,
        });
        res.status(response.status).send(response.data);
      } catch (error: any) {
        if (error.response) {
          res.status(error.response.status).send(error.response.data);
        } else {
          console.error(`[Gateway] Proxy error for ${req.method} ${req.path}:`, error.message);
          res.status(502).send({ error: 'Proxy error', details: error.message });
        }
      }
    };
  }

  @All('crm/*path')
  async proxyCrm(@Req() req: Request, @Res() res: Response) {
    return this.createProxy(process.env.CRM_SERVICE_URL || 'http://localhost:3001', '/crm')(req, res);
  }

  @All('quotation/*path')
  async proxyQuotation(@Req() req: Request, @Res() res: Response) {
    return this.createProxy(process.env.QUOTATION_SERVICE_URL || 'http://localhost:3002', '/quotation')(req, res);
  }

  @All('inventory/*path')
  async proxyInventory(@Req() req: Request, @Res() res: Response) {
    return this.createProxy(process.env.QUOTATION_SERVICE_URL || 'http://localhost:3002', '/inventory')(req, res);
  }

  @All('projects/*path')
  async proxyProjects(@Req() req: Request, @Res() res: Response) {
    return this.createProxy(process.env.PROJECT_SERVICE_URL || 'http://localhost:3003', '/projects')(req, res);
  }

  @All('permits/*path')
  async proxyPermits(@Req() req: Request, @Res() res: Response) {
    return this.createProxy(process.env.PERMIT_SERVICE_URL || 'http://localhost:3006', '/permits')(req, res);
  }

  @All('monitoring/*path')
  async proxyMonitoring(@Req() req: Request, @Res() res: Response) {
    return this.createProxy(process.env.MONITORING_SERVICE_URL || 'http://localhost:3007', '/monitoring')(req, res);
  }

  @All('billing/*path')
  async proxyBilling(@Req() req: Request, @Res() res: Response) {
    return this.createProxy(process.env.BILLING_SERVICE_URL || 'http://localhost:3008', '/billing')(req, res);
  }

  @All('portal/*path')
  async proxyPortal(@Req() req: Request, @Res() res: Response) {
    return this.createProxy(process.env.PORTAL_SERVICE_URL || 'http://localhost:3009', '/portal')(req, res);
  }

  @All('analytics/*path')
  async proxyAnalytics(@Req() req: Request, @Res() res: Response) {
    return this.createProxy(process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3010', '/analytics')(req, res);
  }
}