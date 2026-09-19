import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config } from '../config/index.js';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter | null {
    if (this.transporter) return this.transporter;

    if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
      console.warn('SMTP not configured. Emails will not be sent.');
      return null;
    }

    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });

    return this.transporter;
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    const transporter = this.getTransporter();
    if (!transporter) {
      console.log('Email not sent (SMTP not configured):', options.subject);
      return false;
    }

    try {
      await transporter.sendMail({
        from: `"GlowTeva Organics" <${config.smtp.from}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendContactNotification(contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<boolean> {
    const adminHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Georgia, serif; line-height: 1.6; color: #2C3E2D; max-width: 600px; margin: 0 auto; padding: 20px; background: #F8F5F0; }
            .container { background: white; border-radius: 12px; padding: 32px; border: 1px solid #DED7CC; }
            .header { text-align: center; margin-bottom: 24px; }
            .logo { font-size: 24px; font-weight: 600; color: #2C3E2D; letter-spacing: 0.15em; }
            .tagline { color: #C5A46E; font-size: 14px; margin-top: 4px; }
            .field { margin-bottom: 16px; }
            .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #4A5D4E; margin-bottom: 4px; }
            .value { font-size: 16px; color: #2C3E2D; }
            .message-box { background: #F8F5F0; border-radius: 8px; padding: 16px; border: 1px solid #DED7CC; }
            .footer { text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #DED7CC; color: #4A5D4E; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">GLOWTEVA</div>
              <div class="tagline">New Contact Message</div>
            </div>
            <div class="field">
              <div class="label">Name</div>
              <div class="value">${contactData.name}</div>
            </div>
            <div class="field">
              <div class="label">Email</div>
              <div class="value">${contactData.email}</div>
            </div>
            <div class="field">
              <div class="label">Subject</div>
              <div class="value">${contactData.subject}</div>
            </div>
            <div class="field">
              <div class="label">Message</div>
              <div class="message-box">${contactData.message.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="footer">
              Sent from GlowTeva Organics Contact Form
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: config.adminEmail,
      subject: `New Contact: ${contactData.subject}`,
      html: adminHtml,
    });
  }

  async sendContactConfirmation(contactData: {
    name: string;
    email: string;
  }): Promise<boolean> {
    const userHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Georgia, serif; line-height: 1.6; color: #2C3E2D; max-width: 600px; margin: 0 auto; padding: 20px; background: #F8F5F0; }
            .container { background: white; border-radius: 12px; padding: 32px; border: 1px solid #DED7CC; }
            .header { text-align: center; margin-bottom: 24px; }
            .logo { font-size: 24px; font-weight: 600; color: #2C3E2D; letter-spacing: 0.15em; }
            .tagline { color: #C5A46E; font-size: 14px; margin-top: 4px; }
            .content { font-size: 16px; color: #2C3E2D; }
            .gold-line { height: 1px; width: 64px; background: #C5A46E; margin: 24px auto; }
            .footer { text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #DED7CC; color: #4A5D4E; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">GLOWTEVA</div>
              <div class="tagline">Thank you for reaching out</div>
            </div>
            <div class="content">
              <p>Dear ${contactData.name},</p>
              <p>We've received your message and our team will get back to you within 24 hours.</p>
              <p>In the meantime, feel free to explore our <a href="${config.clientUrl}/shop" style="color: #C5A46E;">latest collections</a> or read our <a href="${config.clientUrl}/journal" style="color: #C5A46E;">journal</a> for skincare rituals and tips.</p>
            </div>
            <div class="gold-line"></div>
            <div class="footer">
              With botanical care,<br>The GlowTeva Team
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: contactData.email,
      subject: 'We received your message - GlowTeva Organics',
      html: userHtml,
    });
  }
}

export const emailService = new EmailService();