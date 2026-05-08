import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: '74.125.133.108',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'greentechucc@gmail.com',
        pass: process.env.SMTP_PASS || 'invalidated_pass',
      },
      tls: {
        rejectUnauthorized: false,
        servername: 'smtp.gmail.com',
      },
    });
  }

  async sendWelcomeEmail(toEmail: string, userName: string) {
    const html = this.buildWelcomeHtml(userName);
    try {
      await this.transporter.sendMail({
        from: '"GreenTech Solutions" <greentechucc@gmail.com>',
        to: toEmail,
        subject: '☀️ ¡Bienvenido a GreenTech Solutions!',
        html,
      });
      console.log(`[MailService] Welcome email sent to ${toEmail}`);
    } catch (error) {
      console.error(`[MailService] Failed to send welcome email:`, error);
    }
  }

  private buildWelcomeHtml(userName: string): string {
    const portalUrl = process.env.FRONTEND_URL || 'http://localhost:3011';
    const year = new Date().getFullYear();
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenido a GreenTech</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0f0a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0f0a;padding:48px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#111711;border-radius:24px;overflow:hidden;border:1px solid #1e3a1e;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#052e16 0%,#064e16 40%,#065f46 100%);padding:56px 48px 48px;text-align:center;position:relative;">
              <div style="display:inline-block;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.3);border-radius:20px;padding:16px 24px;margin-bottom:28px;">
                <span style="font-size:36px;">☀️</span>
                <span style="font-size:22px;font-weight:900;color:#34d399;letter-spacing:-0.5px;margin-left:10px;vertical-align:middle;">GreenTech</span>
              </div>
              <h1 style="color:#ffffff;font-size:34px;margin:0 0 12px;font-weight:800;letter-spacing:-1px;line-height:1.2;">
                ¡Tu cuenta está lista,<br/>${userName}! 🎉
              </h1>
              <p style="color:#6ee7b7;font-size:16px;margin:0;font-weight:500;">
                Portal de energía solar inteligente · ${year}
              </p>
            </td>
          </tr>

          <!-- Mensaje principal -->
          <tr>
            <td style="padding:44px 48px 32px;">
              <p style="color:#a3a3a3;font-size:16px;line-height:1.75;margin:0 0 28px;">
                Nos emociona tenerte como parte de la familia <strong style="color:#34d399;">GreenTech Solutions</strong>. 
                Tu cuenta ha sido creada exitosamente — ahora tienes acceso completo a tu panel de control solar, 
                diseñado para que tengas visibilidad total de tu sistema fotovoltaico en tiempo real.
              </p>

              <!-- Divider -->
              <div style="height:1px;background:linear-gradient(90deg,transparent,#1e3a1e,transparent);margin-bottom:32px;"></div>

              <h3 style="color:#e5e5e5;font-size:16px;font-weight:700;margin:0 0 20px;letter-spacing:0.5px;text-transform:uppercase;">
                ⚡ Lo que puedes hacer ahora
              </h3>

              <!-- Feature cards -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:12px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0d1f0d;border:1px solid #1a3a1a;border-radius:14px;padding:18px 20px;">
                      <tr>
                        <td width="44" style="vertical-align:top;padding-right:16px;">
                          <div style="width:40px;height:40px;background:rgba(16,185,129,0.15);border-radius:10px;text-align:center;line-height:40px;font-size:20px;">📊</div>
                        </td>
                        <td>
                          <strong style="color:#e5e5e5;font-size:14px;">Monitoreo en Tiempo Real</strong>
                          <p style="color:#737373;font-size:13px;margin:4px 0 0;line-height:1.5;">Generación de energía, rendimiento de paneles y ahorro acumulado desde tu dashboard.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:12px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0d1f0d;border:1px solid #1a3a1a;border-radius:14px;padding:18px 20px;">
                      <tr>
                        <td width="44" style="vertical-align:top;padding-right:16px;">
                          <div style="width:40px;height:40px;background:rgba(16,185,129,0.15);border-radius:10px;text-align:center;line-height:40px;font-size:20px;">🏗️</div>
                        </td>
                        <td>
                          <strong style="color:#e5e5e5;font-size:14px;">Estado de tu Instalación</strong>
                          <p style="color:#737373;font-size:13px;margin:4px 0 0;line-height:1.5;">Avance por fase: diseño, trámites, instalación y conexión a la red eléctrica.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:12px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0d1f0d;border:1px solid #1a3a1a;border-radius:14px;padding:18px 20px;">
                      <tr>
                        <td width="44" style="vertical-align:top;padding-right:16px;">
                          <div style="width:40px;height:40px;background:rgba(16,185,129,0.15);border-radius:10px;text-align:center;line-height:40px;font-size:20px;">💳</div>
                        </td>
                        <td>
                          <strong style="color:#e5e5e5;font-size:14px;">Facturación & Pagos</strong>
                          <p style="color:#737373;font-size:13px;margin:4px 0 0;line-height:1.5;">Historial de facturas, cuotas pagadas y estado de cuenta organizado por proyecto.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0d1f0d;border:1px solid #1a3a1a;border-radius:14px;padding:18px 20px;">
                      <tr>
                        <td width="44" style="vertical-align:top;padding-right:16px;">
                          <div style="width:40px;height:40px;background:rgba(16,185,129,0.15);border-radius:10px;text-align:center;line-height:40px;font-size:20px;">🛟</div>
                        </td>
                        <td>
                          <strong style="color:#e5e5e5;font-size:14px;">Soporte Técnico Prioritario</strong>
                          <p style="color:#737373;font-size:13px;margin:4px 0 0;line-height:1.5;">Crea tickets y recibe atención de nuestros ingenieros en menos de 24 horas.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:8px 48px 48px;text-align:center;">
              <a href="${portalUrl}" style="display:inline-block;background:linear-gradient(135deg,#059669,#10b981);color:#ffffff;text-decoration:none;padding:18px 48px;border-radius:14px;font-size:16px;font-weight:700;letter-spacing:0.3px;">
                Ingresar a mi Portal →
              </a>
              <p style="color:#525252;font-size:12px;margin:20px 0 0;">
                O copia este enlace: <span style="color:#34d399;">${portalUrl}</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0d150d;padding:28px 48px;text-align:center;border-top:1px solid #1e3a1e;">
              <p style="color:#525252;font-size:12px;margin:0 0 6px;">
                <strong style="color:#34d399;">GreenTech Solutions</strong> © ${year} · Energía solar inteligente
              </p>
              <p style="color:#404040;font-size:11px;margin:0;">
                Este correo fue enviado automáticamente. Si no creaste esta cuenta, puedes ignorar este mensaje.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  async sendResetEmail(toEmail: string, code: string, userName: string) {
    const html = this.buildResetHtml(code, userName);
    try {
      await this.transporter.sendMail({
        from: '"GreenTech Seguridad" <greentechucc@gmail.com>',
        to: toEmail,
        subject: '🔒 Tu código de verificación — GreenTech',
        html,
      });
      console.log(`[MailService] Reset OTP sent to ${toEmail}`);
    } catch (error) {
      console.error(`[MailService] Failed to send reset email:`, error);
    }
  }

  private buildResetHtml(code: string, userName: string): string {
    const year = new Date().getFullYear();
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#111118;border-radius:24px;overflow:hidden;border:1px solid #1e1e3a;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f0f23 0%,#1a1a3e 100%);padding:52px 48px 44px;text-align:center;">
            <div style="display:inline-block;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);border-radius:16px;padding:14px 20px;margin-bottom:24px;">
              <span style="font-size:28px;">🔐</span>
              <span style="font-size:18px;font-weight:800;color:#818cf8;letter-spacing:-0.5px;margin-left:8px;vertical-align:middle;">Verificación</span>
            </div>
            <h1 style="color:#ffffff;font-size:28px;margin:0 0 10px;font-weight:800;letter-spacing:-0.5px;">
              Código de recuperación
            </h1>
            <p style="color:#6366f1;font-size:15px;margin:0;font-weight:500;">
              Solicitado para la cuenta de ${userName}
            </p>
          </td>
        </tr>

        <!-- Contenido -->
        <tr>
          <td style="padding:44px 48px;">
            <p style="color:#a3a3a3;font-size:15px;line-height:1.7;margin:0 0 32px;">
              Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en GreenTech. 
              Usa el siguiente código de seguridad de un solo uso. <strong style="color:#e5e5e5;">Caduca en 10 minutos.</strong>
            </p>

            <!-- Código OTP -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,#0f0f23,#1a1a3e);border:2px solid #3730a3;border-radius:18px;padding:32px;text-align:center;">
                  <p style="color:#6366f1;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 16px;">Tu código de seguridad</p>
                  <div style="font-size:52px;font-weight:900;letter-spacing:16px;color:#a5b4fc;font-family:'Courier New',monospace;">
                    ${code}
                  </div>
                  <p style="color:#4b5563;font-size:12px;margin:16px 0 0;">⏱ Válido por 10 minutos desde su generación</p>
                </td>
              </tr>
            </table>

            <!-- Alerta -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
              <tr>
                <td style="background:#1c0f0f;border:1px solid #7f1d1d;border-radius:12px;padding:18px 20px;">
                  <p style="color:#fca5a5;font-size:13px;margin:0;line-height:1.6;">
                    <strong>⚠️ Importante:</strong> Si no solicitaste este código, alguien puede estar intentando acceder a tu cuenta. 
                    Ignora este correo y considera cambiar tu contraseña.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0d0d14;padding:24px 48px;text-align:center;border-top:1px solid #1e1e3a;">
            <p style="color:#525252;font-size:12px;margin:0 0 4px;">
              <strong style="color:#6366f1;">GreenTech Solutions</strong> © ${year} · Sistema de seguridad
            </p>
            <p style="color:#404040;font-size:11px;margin:0;">
              Este correo fue generado automáticamente. No respondas a este mensaje.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  async sendSecurityAlertEmail(toEmail: string, userName: string, unlockToken: string) {
    const html = this.buildSecurityAlertHtml(userName, unlockToken);
    try {
      await this.transporter.sendMail({
        from: '"GreenTech Seguridad" <greentechucc@gmail.com>',
        to: toEmail,
        subject: '🚨 Alerta: Tu cuenta ha sido bloqueada — GreenTech',
        html,
      });
      console.log(`[MailService] Security alert sent to ${toEmail}`);
    } catch (error) {
      console.error(`[MailService] Failed to send security alert:`, error);
    }
  }

  private buildSecurityAlertHtml(userName: string, unlockToken: string): string {
    const unlockUrl = `${process.env.FRONTEND_URL || 'http://localhost:3011'}/auth/unlock?token=${unlockToken}`;
    const year = new Date().getFullYear();
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#0f0a0a;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#180f0f;border-radius:24px;overflow:hidden;border:1px solid #3f1515;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1c0505 0%,#3b0f0f 50%,#7f1d1d 100%);padding:52px 48px 44px;text-align:center;">
            <div style="display:inline-block;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.4);border-radius:16px;padding:14px 20px;margin-bottom:24px;">
              <span style="font-size:28px;">🛡️</span>
              <span style="font-size:18px;font-weight:800;color:#fca5a5;letter-spacing:-0.5px;margin-left:8px;vertical-align:middle;">Alerta de Seguridad</span>
            </div>
            <h1 style="color:#ffffff;font-size:30px;margin:0 0 10px;font-weight:800;letter-spacing:-0.5px;">
              Cuenta bloqueada temporalmente
            </h1>
            <p style="color:#fca5a5;font-size:15px;margin:0;">
              Hola ${userName}, detectamos actividad inusual en tu cuenta
            </p>
          </td>
        </tr>

        <!-- Contenido -->
        <tr>
          <td style="padding:44px 48px;">

            <!-- Alerta principal -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#1c0a0a;border:1px solid #7f1d1d;border-radius:14px;padding:24px;">
                  <p style="color:#fca5a5;font-size:15px;margin:0 0 8px;font-weight:700;">🚨 ¿Qué ocurrió?</p>
                  <p style="color:#a3a3a3;font-size:14px;margin:0;line-height:1.7;">
                    Hemos detectado <strong style="color:#f87171;">3 intentos fallidos consecutivos</strong> de inicio de sesión en tu cuenta. 
                    Por tu seguridad, hemos bloqueado el acceso temporalmente durante <strong style="color:#f87171;">1 hora</strong>.
                  </p>
                </td>
              </tr>
            </table>

            <p style="color:#a3a3a3;font-size:15px;line-height:1.7;margin:0 0 28px;">
              Si fuiste tú quien intentó ingresar, puedes desbloquear tu cuenta de inmediato haciendo clic en el botón de abajo. 
              Si <strong style="color:#e5e5e5;">no reconoces</strong> esta actividad, te recomendamos cambiar tu contraseña cuanto antes.
            </p>

            <!-- Pasos -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="background:#1a0f0f;border:1px solid #3f1515;border-radius:14px;padding:24px;">
                  <p style="color:#e5e5e5;font-size:14px;font-weight:700;margin:0 0 16px;">¿Qué puedes hacer?</p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding-bottom:12px;vertical-align:top;">
                        <span style="color:#f87171;font-size:13px;">① </span>
                        <span style="color:#a3a3a3;font-size:13px;line-height:1.5;">Haz clic en <strong style="color:#e5e5e5;">"Reactivar mi Cuenta"</strong> para desbloquearla inmediatamente.</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom:12px;vertical-align:top;">
                        <span style="color:#f87171;font-size:13px;">② </span>
                        <span style="color:#a3a3a3;font-size:13px;line-height:1.5;">Espera <strong style="color:#e5e5e5;">1 hora</strong> y el bloqueo se levantará automáticamente.</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="vertical-align:top;">
                        <span style="color:#f87171;font-size:13px;">③ </span>
                        <span style="color:#a3a3a3;font-size:13px;line-height:1.5;">Si no reconoces esta actividad, cambia tu contraseña desde la opción "Olvidé mi contraseña".</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <div style="text-align:center;">
              <a href="${unlockUrl}" style="display:inline-block;background:linear-gradient(135deg,#b91c1c,#ef4444);color:#fff;text-decoration:none;padding:18px 48px;border-radius:14px;font-weight:700;font-size:16px;letter-spacing:0.3px;">
                🔓 Reactivar mi Cuenta
              </a>
              <p style="color:#525252;font-size:11px;margin:16px 0 0;">
                Este enlace expira en 1 hora por razones de seguridad.
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#120a0a;padding:24px 48px;text-align:center;border-top:1px solid #3f1515;">
            <p style="color:#525252;font-size:12px;margin:0 0 4px;">
              <strong style="color:#f87171;">GreenTech Solutions</strong> © ${year} · Equipo de Seguridad
            </p>
            <p style="color:#404040;font-size:11px;margin:0;">
              Si no reconoces esta cuenta, ignora este correo de forma segura.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  async sendNoAccountEmail(toEmail: string) {
    const html = this.buildNoAccountHtml();
    try {
      await this.transporter.sendMail({
        from: '"GreenTech Soporte" <greentechucc@gmail.com>',
        to: toEmail,
        subject: '🌱 ¿Aún no tienes cuenta? Únete a GreenTech',
        html,
      });
      console.log(`[MailService] No-account invitation sent to ${toEmail}`);
    } catch (error) {
      console.error(`[MailService] Failed to send no-account email:`, error);
    }
  }

  private buildNoAccountHtml(toEmail: string = ''): string {
    const portalUrl = process.env.FRONTEND_URL || 'http://localhost:3011';
    const year = new Date().getFullYear();
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#0a0f0a;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#111711;border-radius:24px;overflow:hidden;border:1px solid #1e3a1e;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#052e16 0%,#064e16 50%,#065f46 100%);padding:52px 48px 44px;text-align:center;">
            <div style="font-size:52px;margin-bottom:20px;">🌍</div>
            <h1 style="color:#ffffff;font-size:28px;margin:0 0 10px;font-weight:800;letter-spacing:-0.5px;">
              ¡Oops! Aún no te conocemos
            </h1>
            <p style="color:#6ee7b7;font-size:15px;margin:0;">
              Recibimos una solicitud de recuperación para este correo
            </p>
          </td>
        </tr>

        <!-- Contenido -->
        <tr>
          <td style="padding:44px 48px;">
            <p style="color:#a3a3a3;font-size:15px;line-height:1.75;margin:0 0 24px;">
              Alguien solicitó una recuperación de contraseña para <strong style="color:#e5e5e5;">${toEmail}</strong>, 
              pero no encontramos ninguna cuenta de GreenTech vinculada a este correo.
            </p>

            <!-- Info box -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="background:#0d1f0d;border:1px solid #1a3a1a;border-radius:14px;padding:24px;">
                  <p style="color:#34d399;font-size:14px;font-weight:700;margin:0 0 12px;">🌱 ¿Eres cliente de GreenTech?</p>
                  <p style="color:#a3a3a3;font-size:13px;margin:0;line-height:1.7;">
                    Si tienes un proyecto de energía solar con nosotros, puedes crear tu cuenta gratis y acceder 
                    a monitoreo en tiempo real, estado de tu instalación, facturas y soporte técnico desde un solo lugar.
                  </p>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <div style="text-align:center;">
              <a href="${portalUrl}/auth?view=register" style="display:inline-block;background:linear-gradient(135deg,#059669,#10b981);color:#fff;text-decoration:none;padding:18px 48px;border-radius:14px;font-weight:700;font-size:16px;">
                ☀️ Crear mi Cuenta Gratis
              </a>
              <p style="color:#525252;font-size:12px;margin:16px 0 0;">
                Solo toma 1 minuto · Sin tarjeta de crédito
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0d150d;padding:24px 48px;text-align:center;border-top:1px solid #1e3a1e;">
            <p style="color:#525252;font-size:12px;margin:0 0 4px;">
              <strong style="color:#34d399;">GreenTech Solutions</strong> © ${year} · Energía solar inteligente
            </p>
            <p style="color:#404040;font-size:11px;margin:0;">
              Si no solicitaste esto, puedes ignorar este correo con total seguridad.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }
}