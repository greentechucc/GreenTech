"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
let MailService = class MailService {
    transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER || 'greentechucc@gmail.com',
                pass: process.env.SMTP_PASS || 'invalidated_pass',
            },
        });
    }
    async sendWelcomeEmail(toEmail, userName) {
        const html = this.buildWelcomeHtml(userName);
        try {
            await this.transporter.sendMail({
                from: '"GreenTech Solutions" <greentechucc@gmail.com>',
                to: toEmail,
                subject: '☀️ ¡Bienvenido a GreenTech Solutions!',
                html,
            });
            console.log(`[MailService] Welcome email sent to ${toEmail}`);
        }
        catch (error) {
            console.error(`[MailService] Failed to send welcome email:`, error);
        }
    }
    buildWelcomeHtml(userName) {
        return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.08);">
              
              <!-- Header con gradiente -->
              <tr>
                <td style="background:linear-gradient(135deg,#059669 0%,#10b981 50%,#34d399 100%);padding:48px 40px;text-align:center;">
                  <div style="width:80px;height:80px;background-color:rgba(255,255,255,0.2);border-radius:20px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:42px;">☀️</span>
                  </div>
                  <h1 style="color:#ffffff;font-size:32px;margin:0 0 8px;font-weight:800;letter-spacing:-0.5px;">
                    ¡Bienvenido a GreenTech!
                  </h1>
                  <p style="color:rgba(255,255,255,0.85);font-size:16px;margin:0;font-weight:500;">
                    Tu portal de energía solar inteligente
                  </p>
                </td>
              </tr>

              <!-- Saludo -->
              <tr>
                <td style="padding:40px 40px 20px;">
                  <h2 style="color:#1e293b;font-size:22px;margin:0 0 16px;font-weight:700;">
                    Hola, ${userName} 👋
                  </h2>
                  <p style="color:#64748b;font-size:16px;line-height:1.7;margin:0;">
                    Nos emociona tenerte como parte de la familia <strong style="color:#059669;">GreenTech Solutions</strong>. 
                    Tu cuenta ha sido creada exitosamente y ahora tienes acceso completo a nuestro portal de cliente, 
                    diseñado para que tengas el control total de tu sistema de energía solar.
                  </p>
                </td>
              </tr>

              <!-- Separador -->
              <tr>
                <td style="padding:0 40px;">
                  <div style="height:1px;background:linear-gradient(90deg,transparent,#e2e8f0,transparent);"></div>
                </td>
              </tr>

              <!-- Funciones -->
              <tr>
                <td style="padding:30px 40px 10px;">
                  <h3 style="color:#1e293b;font-size:18px;margin:0 0 24px;font-weight:700;">
                    🚀 Lo que puedes hacer en tu portal
                  </h3>
                </td>
              </tr>

              <!-- Feature 1 -->
              <tr>
                <td style="padding:0 40px 16px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-radius:16px;padding:20px;">
                    <tr>
                      <td width="56" style="padding:0 16px 0 0;vertical-align:top;">
                        <div style="width:48px;height:48px;background-color:#dcfce7;border-radius:12px;text-align:center;line-height:48px;font-size:24px;">
                          📊
                        </div>
                      </td>
                      <td style="vertical-align:middle;">
                        <strong style="color:#1e293b;font-size:15px;">Monitoreo en Tiempo Real</strong>
                        <p style="color:#64748b;font-size:13px;margin:4px 0 0;line-height:1.5;">
                          Visualiza la generación de energía, el rendimiento de tus paneles y el ahorro acumulado desde tu dashboard personalizado.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Feature 2 -->
              <tr>
                <td style="padding:0 40px 16px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eff6ff;border-radius:16px;padding:20px;">
                    <tr>
                      <td width="56" style="padding:0 16px 0 0;vertical-align:top;">
                        <div style="width:48px;height:48px;background-color:#dbeafe;border-radius:12px;text-align:center;line-height:48px;font-size:24px;">
                          📁
                        </div>
                      </td>
                      <td style="vertical-align:middle;">
                        <strong style="color:#1e293b;font-size:15px;">Gestión de Proyectos</strong>
                        <p style="color:#64748b;font-size:13px;margin:4px 0 0;line-height:1.5;">
                          Consulta el estado de tu instalación, el avance de cada fase del proyecto y las especificaciones técnicas de tu sistema fotovoltaico.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Feature 3 -->
              <tr>
                <td style="padding:0 40px 16px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef3c7;border-radius:16px;padding:20px;">
                    <tr>
                      <td width="56" style="padding:0 16px 0 0;vertical-align:top;">
                        <div style="width:48px;height:48px;background-color:#fde68a;border-radius:12px;text-align:center;line-height:48px;font-size:24px;">
                          💳
                        </div>
                      </td>
                      <td style="vertical-align:middle;">
                        <strong style="color:#1e293b;font-size:15px;">Facturación & Pagos</strong>
                        <p style="color:#64748b;font-size:13px;margin:4px 0 0;line-height:1.5;">
                          Revisa tus facturas, historial de pagos y estado de cuenta de manera centralizada y organizada por proyecto.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Feature 4 -->
              <tr>
                <td style="padding:0 40px 16px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fdf2f8;border-radius:16px;padding:20px;">
                    <tr>
                      <td width="56" style="padding:0 16px 0 0;vertical-align:top;">
                        <div style="width:48px;height:48px;background-color:#fce7f3;border-radius:12px;text-align:center;line-height:48px;font-size:24px;">
                          🛟
                        </div>
                      </td>
                      <td style="vertical-align:middle;">
                        <strong style="color:#1e293b;font-size:15px;">Soporte Técnico Directo</strong>
                        <p style="color:#64748b;font-size:13px;margin:4px 0 0;line-height:1.5;">
                          Radica solicitudes de soporte y recibe atención prioritaria de nuestro equipo de ingenieros especializados.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Separador -->
              <tr>
                <td style="padding:10px 40px;">
                  <div style="height:1px;background:linear-gradient(90deg,transparent,#e2e8f0,transparent);"></div>
                </td>
              </tr>

              <!-- CTA -->
              <tr>
                <td style="padding:24px 40px;text-align:center;">
                  <p style="color:#64748b;font-size:15px;margin:0 0 20px;line-height:1.6;">
                    Accede ahora a tu portal y comienza a explorar todas las herramientas que hemos preparado para ti.
                  </p>
                  <a href="http://localhost:3011" style="display:inline-block;background:linear-gradient(135deg,#059669,#10b981);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:14px;font-size:16px;font-weight:700;letter-spacing:0.3px;">
                    Ingresar a Mi Portal →
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color:#f8fafc;padding:32px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                  <p style="color:#94a3b8;font-size:13px;margin:0 0 8px;font-weight:600;">
                    GreenTech Solutions © ${new Date().getFullYear()}
                  </p>
                  <p style="color:#cbd5e1;font-size:12px;margin:0;line-height:1.5;">
                    Energía solar inteligente para un futuro sostenible.<br/>
                    Este correo fue enviado automáticamente. No es necesario responder.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
    }
    async sendResetEmail(toEmail, code, userName) {
        const html = this.buildResetHtml(code, userName);
        try {
            await this.transporter.sendMail({
                from: '"GreenTech Seguridad" <greentechucc@gmail.com>',
                to: toEmail,
                subject: '🔒 Código de Recuperación de Contraseña',
                html,
            });
            console.log(`[MailService] Reset OTP sent to ${toEmail}`);
        }
        catch (error) {
            console.error(`[MailService] Failed to send reset email:`, error);
        }
    }
    buildResetHtml(code, userName) {
        return `
    <!DOCTYPE html>
    <html lang="es">
    <body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:24px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);">
            <tr><td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:48px 40px;text-align:center;">
                <div style="width:70px;height:70px;background:rgba(255,255,255,0.1);border-radius:20px;margin:0 auto 16px;line-height:70px;font-size:32px;">🔐</div>
                <h1 style="color:#fff;font-size:28px;margin:0;">Recuperación de Acceso</h1>
            </td></tr>
            <tr><td style="padding:40px;">
                <h2 style="color:#1e293b;font-size:20px;margin:0 0 16px;">Hola, ${userName}</h2>
                <p style="color:#64748b;font-size:16px;line-height:1.6;margin:0 0 24px;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en GreenTech. Usa el siguiente código de seguridad. <b>Caduca en 10 minutos.</b></p>
                <div style="background:#f1f5f9;border:2px dashed #cbd5e1;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
                  <span style="font-size:42px;font-weight:900;letter-spacing:12px;color:#059669;">${code}</span>
                </div>
                <p style="color:#ef4444;font-size:14px;margin:0 0 8px;font-weight:600;">⚠️ Importante: Si no solicitaste este código, NO lo compartas con nadie.</p>
                <p style="color:#94a3b8;font-size:13px;margin:0;">Alguien podría estar intentando acceder a tu cuenta.</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`;
    }
    async sendSecurityAlertEmail(toEmail, userName, unlockToken) {
        const html = this.buildSecurityAlertHtml(userName, unlockToken);
        try {
            await this.transporter.sendMail({
                from: '"GreenTech Seguridad" <greentechucc@gmail.com>',
                to: toEmail,
                subject: '🚨 Alerta de Seguridad: Cuenta Bloqueada',
                html,
            });
            console.log(`[MailService] Security alert sent to ${toEmail}`);
        }
        catch (error) {
            console.error(`[MailService] Failed to send security alert:`, error);
        }
    }
    buildSecurityAlertHtml(userName, unlockToken) {
        const unlockUrl = `http://localhost:3011/auth/unlock?token=${unlockToken}`;
        return `
    <!DOCTYPE html>
    <html lang="es">
    <body style="margin:0;padding:0;background-color:#fff1f2;font-family:'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:24px;overflow:hidden;box-shadow:0 10px 25px rgba(225,29,72,0.1);">
            <tr><td style="background:linear-gradient(135deg,#e11d48 0%,#f43f5e 100%);padding:48px 40px;text-align:center;">
                <div style="width:70px;height:70px;background:rgba(255,255,255,0.2);border-radius:20px;margin:0 auto 16px;line-height:70px;font-size:32px;">🛡️</div>
                <h1 style="color:#fff;font-size:28px;margin:0;">Alerta de Seguridad</h1>
            </td></tr>
            <tr><td style="padding:40px;">
                <h2 style="color:#1e293b;font-size:20px;margin:0 0 16px;">Hola, ${userName}</h2>
                <p style="color:#64748b;font-size:16px;line-height:1.6;margin:0 0 24px;">Hemos detectado múltiples intentos fallidos para iniciar sesión en tu cuenta. Por tu seguridad, <b>hemos bloqueado los intentos de acceso</b> temporalmente.</p>
                <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:16px;margin-bottom:24px;border-radius:0 12px 12px 0;">
                  <p style="color:#b91c1c;font-size:14px;margin:0;">Si fuiste tú y olvidaste tu contraseña, o simplemente quieres restaurar el acceso de inmediato, haz clic en el botón de abajo.</p>
                </div>
                <div style="text-align:center;">
                  <a href="${unlockUrl}" style="display:inline-block;background:#e11d48;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;">Reactivar mi Cuenta</a>
                </div>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`;
    }
    async sendNoAccountEmail(toEmail) {
        const html = this.buildNoAccountHtml();
        try {
            await this.transporter.sendMail({
                from: '"GreenTech Soporte" <greentechucc@gmail.com>',
                to: toEmail,
                subject: '🌱 Únete a GreenTech Solutions',
                html,
            });
            console.log(`[MailService] No-account invitation sent to ${toEmail}`);
        }
        catch (error) {
            console.error(`[MailService] Failed to send no-account email:`, error);
        }
    }
    buildNoAccountHtml() {
        return `
    <!DOCTYPE html>
    <html lang="es">
    <body style="margin:0;padding:0;background-color:#f0fdf4;font-family:'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:24px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);">
            <tr><td style="background:linear-gradient(135deg,#059669 0%,#10b981 100%);padding:48px 40px;text-align:center;">
                <div style="width:70px;height:70px;background:rgba(255,255,255,0.2);border-radius:20px;margin:0 auto 16px;line-height:70px;font-size:32px;">🌍</div>
                <h1 style="color:#fff;font-size:28px;margin:0;">Oops... ¡Aún no te conocemos!</h1>
            </td></tr>
            <tr><td style="padding:40px;">
                <p style="color:#64748b;font-size:16px;line-height:1.6;margin:0 0 24px;">Alguien solicitó una recuperación de contraseña para este correo, pero <b>no hemos encontrado una cuenta de GreenTech vinculada</b> a ti.</p>
                <p style="color:#64748b;font-size:16px;line-height:1.6;margin:0 0 24px;">¡No te preocupes! Si eres cliente de nuestros proyectos de energía solar, puedes crear tu cuenta ahora mismo y empezar a disfrutar de telemetría y monitoreo inteligente.</p>
                <div style="text-align:center;">
                  <a href="http://localhost:3011/auth?view=register" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;">Crear mi Cuenta</a>
                </div>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`;
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MailService);
//# sourceMappingURL=mail.service.js.map