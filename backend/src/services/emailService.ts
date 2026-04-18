import nodemailer from 'nodemailer';

/**
 * EmailService - MORA Project
 * A professional service for transactional emails.
 * Uses Nodemailer with SMTP for reliable delivery.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private from: string;

  constructor() {
    this.from = process.env.SMTP_USER || 'no-reply@moraapp.it';
    
    // Initialize Transporter only if SMTP config is present
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log(`[EMAIL-SERVICE] Transporter initialized for ${process.env.SMTP_USER}`);
    } else {
      console.warn("[EMAIL-SERVICE] SMTP credentials missing. Falling back to console logging.");
    }
  }

  /**
   * Send a generic email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.log("-----------------------------------------");
      console.log(`[EMAIL MOCK] To: ${options.to}`);
      console.log(`[EMAIL MOCK] Subject: ${options.subject}`);
      console.log(`[EMAIL MOCK] Content: (Omitted HTML)`);
      console.log("-----------------------------------------");
      return true;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"MORA Support" <${this.from}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      console.log(`[EMAIL-SERVICE] Email sent: ${info.messageId}`);
      return true;
    } catch (error: any) {
      console.error("[EMAIL-SERVICE-ERROR] Failed to send email:", error.message);
      return false;
    }
  }

  /**
   * Send Email Verification
   */
  async sendVerificationEmail(userName: string, userEmail: string, token: string): Promise<boolean> {
    const verifyLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 24px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; padding: 16px; background: #ff3366; border-radius: 16px; color: white;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
        </div>
        <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; text-align: center; margin-bottom: 8px;">Verifica la tua email</h1>
        <p style="color: #64748b; text-align: center; font-size: 16px; margin-bottom: 32px;">Ciao ${userName}, grazie per esserti registrato su MORA. Per attivare il tuo account, clicca sul pulsante qui sotto.</p>
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${verifyLink}" 
             style="display: inline-block; background: #ff3366; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">
             Verifica Account
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 14px; text-align: center;">Il link scadrà tra 24 ore. Se non hai richiesto tu questa iscrizione, puoi ignorare l'email.</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 32px 0;">
        <p style="font-size: 14px; color: #64748b; text-align: center; font-weight: 600;">MORA - La tua città, in un piatto.</p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: "Verifica la tua email - MORA",
      html
    });
  }

  /**
   * Send Welcome Email
   */
  async sendWelcomeEmail(userName: string, userEmail: string): Promise<boolean> {
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 24px;">
        <h1 style="color: #ff3366; font-size: 28px; font-weight: 800; text-align: center; margin-bottom: 24px;">Benvenuto su MORA! 🍽️</h1>
        <p style="color: #0f172a; font-size: 16px; line-height: 1.6;">Ciao <strong>${userName}</strong>,</p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Siamo felici di darti il benvenuto nella nostra community. MORA è progettata per farti vivere il meglio della gastronomia locale in modo smart e veloce.</p>
        <div style="background: #fff1f2; padding: 32px; border-radius: 20px; margin: 32px 0;">
          <h3 style="margin-top: 0; color: #e11d48; font-size: 18px;">Cosa puoi fare ora:</h3>
          <ul style="color: #475569; padding-left: 20px; font-size: 15px; line-height: 2;">
            <li>Esplora i migliori ristoranti vicino a te 📍</li>
            <li>Segui i tuoi locali preferiti per news e menu 🔔</li>
            <li>Scopri eventi e degustazioni esclusive 🍷</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
             style="display: inline-block; background: #000; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 700;">
             Inizia l'Esplorazione
          </a>
        </div>
        <p style="color: #64748b; font-size: 14px;">Hai bisogno di aiuto? Rispondi semplicemente a questa email.</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 32px 0;">
        <p style="font-size: 14px; color: #94a3b8; text-align: center;">MORA - La tua città, in un piatto.</p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: "Benvenuto su MORA! 🍽️",
      html
    });
  }

  /**
   * Send Password Reset Email
   */
  async sendPasswordResetEmail(userEmail: string, resetLink: string): Promise<boolean> {
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 24px;">
        <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; text-align: center; margin-bottom: 24px;">Ripristino Password 🔐</h1>
        <p style="color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">Abbiamo ricevuto una richiesta per reimpostare la password del tuo account MORA.</p>
        <div style="background: #f8fafc; padding: 32px; border-radius: 20px; margin: 32px 0; text-align: center; border: 1px solid #e2e8f0;">
          <p style="margin-top: 0; font-weight: 700; color: #1e293b; margin-bottom: 24px;">Clicca il pulsante qui sotto per procedere:</p>
          <a href="${resetLink}" 
             style="display: inline-block; background: #000; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 700;">
             Reimposta Password
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 13px; text-align: center;">Il link scadrà tra 1 ora. Se non hai richiesto tu il reset, ignora pure questa comunicazione.</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 32px 0;">
        <p style="font-size: 14px; color: #94a3b8; text-align: center;">MORA - Sicurezza e Comodità.</p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: "Ripristino Password - MORA",
      html
    });
  }
}

export default new EmailService();
