"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const index_js_1 = require("../config/index.js");
class EmailService {
    transporter = null;
    getTransporter() {
        if (this.transporter)
            return this.transporter;
        if (!index_js_1.config.smtp.host || !index_js_1.config.smtp.user || !index_js_1.config.smtp.pass) {
            console.warn('SMTP not configured. Emails will not be sent.');
            return null;
        }
        this.transporter = nodemailer_1.default.createTransport({
            host: index_js_1.config.smtp.host,
            port: index_js_1.config.smtp.port,
            secure: index_js_1.config.smtp.secure,
            auth: {
                user: index_js_1.config.smtp.user,
                pass: index_js_1.config.smtp.pass,
            },
        });
        return this.transporter;
    }
    async sendEmail(options) {
        const transporter = this.getTransporter();
        if (!transporter) {
            console.log('Email not sent (SMTP not configured):', options.subject);
            return false;
        }
        try {
            await transporter.sendMail({
                from: `"GlowTeva Organics" <${index_js_1.config.smtp.from}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            });
            return true;
        }
        catch (error) {
            console.error('Failed to send email:', error);
            return false;
        }
    }
    async testConnection() {
        const transporter = this.getTransporter();
        if (!transporter) {
            console.warn('SMTP not configured. Cannot test connection.');
            return false;
        }
        try {
            await transporter.verify();
            console.log('SMTP connection verified successfully.');
            return true;
        }
        catch (error) {
            console.error('SMTP connection failed:', error);
            return false;
        }
    }
    async sendContactNotification(contactData) {
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
            to: index_js_1.config.adminEmail,
            subject: `New Contact: ${contactData.subject}`,
            html: adminHtml,
        });
    }
    async sendContactConfirmation(contactData) {
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
              <p>In the meantime, feel free to explore our <a href="${index_js_1.config.clientUrl}/shop" style="color: #C5A46E;">latest collections</a> or read our <a href="${index_js_1.config.clientUrl}/journal" style="color: #C5A46E;">journal</a> for skincare rituals and tips.</p>
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
    async sendOrderConfirmation(orderData) {
        const itemsHtml = orderData.items
            .map((item) => `
        <tr>
          <td style="padding:12px;border:1px solid #DED7CC;font-size:14px;color:#2C3E2D;">
            ${item.name} (x${item.quantity})
          </td>
          <td style="padding:12px;border:1px solid #DED7CC;font-size:14px;color:#2C3E2D;text-align:right;">
            $${item.subtotal.toFixed(2)}
          </td>
        </tr>`)
            .join('');
        const paymentMethodName = orderData.paymentMethod.replace('_', ' ');
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
            .status-badge { display: inline-block; background: #2C3E2D; color: #C5A46E; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; letter-spacing: 0.05em; margin-top: 8px; }
            .section { margin: 24px 0; }
            .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #4A5D4E; margin-bottom: 4px; }
            .value { font-size: 15px; color: #2C3E2D; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th { text-align: left; padding: 12px; background: #F8F5F0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #4A5D4E; border-bottom: 2px solid #C5A46E; }
            .summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #2C3E2D; }
            .summary-row.total { border-top: 2px solid #C5A46E; margin-top: 8px; padding-top: 12px; font-weight: 700; font-size: 16px; color: #2C3E2D; }
            .gold-line { height: 1px; width: 64px; background: #C5A46E; margin: 24px auto; }
            .footer { text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #DED7CC; color: #4A5D4E; font-size: 12px; }
            .order-id { font-family: monospace; background: #F8F5F0; padding: 2px 8px; border-radius: 4px; font-size: 14px; color: #C5A46E; }
            .address-box { background: #F8F5F0; border-radius: 8px; padding: 16px; border: 1px solid #DED7CC; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">GLOWTEVA</div>
              <div class="tagline">Order Confirmation</div>
              <div class="status-badge">Order ${orderData.orderStatus}</div>
            </div>
            <div class="section">
              <p style="font-size:16px;color:#2C3E2D;">Dear ${orderData.userName},</p>
              <p style="font-size:15px;color:#2C3E2D;">Thank you for your order! Your order has been ${orderData.orderStatus === 'CONFIRMED' ? 'confirmed' : 'received'}.</p>
              <p style="font-size:15px;color:#2C3E2D;">Your Order ID: <span class="order-id">${orderData.orderNumber}</span></p>
            </div>
            <div class="section">
              <div class="label">Order Details</div>
              <table>
                <thead><tr><th>Item</th><th style="text-align:right">Total</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
              </table>
            </div>
            <div class="section">
              <div class="label">Shipping Address</div>
              <div class="address-box">
                <p style="font-size:15px;color:#2C3E2D;">${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}</p>
                <p style="font-size:14px;color:#2C3E2D;">${orderData.shippingAddress.street}</p>
                <p style="font-size:14px;color:#2C3E2D;">${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.postalCode}</p>
                <p style="font-size:14px;color:#2C3E2D;">${orderData.shippingAddress.country}</p>
              </div>
            </div>
            <div class="section">
              <div class="summary-row"><span>Subtotal</span><span>$${orderData.subtotal.toFixed(2)}</span></div>
              <div class="summary-row"><span>Shipping</span><span>${orderData.shippingCost === 0 ? 'Free' : '$' + orderData.shippingCost.toFixed(2)}</span></div>
              ${orderData.discount > 0 ? `<div class="summary-row"><span>Discount</span><span>-$${orderData.discount.toFixed(2)}</span></div>` : ''}
              <div class="summary-row total"><span>Total</span><span>$${orderData.total.toFixed(2)}</span></div>
            </div>
            <div class="gold-line"></div>
            <div class="footer">
              Payment Method: ${paymentMethodName}<br>
              You can track your order from your account page.<br>
              With botanical care,<br>The GlowTeva Team
            </div>
          </div>
        </body>
      </html>
    `;
        return this.sendEmail({
            to: orderData.userEmail,
            subject: `Order ${orderData.orderNumber} - GlowTeva Organics`,
            html: userHtml,
        });
    }
    async sendOrderAdminNotification(orderData) {
        const itemsHtml = orderData.items
            .map((item) => `
        <tr>
          <td style="padding:12px;border:1px solid #DED7CC;font-size:14px;color:#2C3E2D;">
            ${item.name} (x${item.quantity})
          </td>
          <td style="padding:12px;border:1px solid #DED7CC;font-size:14px;color:#2C3E2D;text-align:right;">
            $${item.subtotal.toFixed(2)}
          </td>
        </tr>`)
            .join('');
        const paymentMethodName = orderData.paymentMethod.replace('_', ' ');
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
            .alert-badge { display: inline-block; background: #C5A46E; color: #2C3E2D; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; letter-spacing: 0.05em; }
            .section { margin: 24px 0; }
            .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #4A5D4E; margin-bottom: 4px; }
            .value { font-size: 15px; color: #2C3E2D; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th { text-align: left; padding: 12px; background: #F8F5F0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #4A5D4E; border-bottom: 2px solid #C5A46E; }
            .summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #2C3E2D; }
            .summary-row.total { border-top: 2px solid #C5A46E; margin-top: 8px; padding-top: 12px; font-weight: 700; font-size: 16px; color: #2C3E2D; }
            .gold-line { height: 1px; width: 64px; background: #C5A46E; margin: 24px auto; }
            .footer { text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #DED7CC; color: #4A5D4E; font-size: 12px; }
            .order-id { font-family: monospace; background: #F8F5F0; padding: 2px 8px; border-radius: 4px; font-size: 14px; color: #C5A46E; }
            .address-box { background: #F8F5F0; border-radius: 8px; padding: 16px; border: 1px solid #DED7CC; }
            .customer-link { color: #C5A46E; text-decoration: none; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">GLOWTEVA</div>
              <div class="tagline">New Order Received</div>
              <div class="alert-badge">ACTION REQUIRED</div>
            </div>
            <div class="section">
              <p style="font-size:16px;color:#2C3E2D;">A new order has been placed.</p>
              <p style="font-size:15px;color:#2C3E2D;">Order ID: <span class="order-id">${orderData.orderNumber}</span></p>
            </div>
            <div class="section">
              <div class="label">Customer</div>
              <div class="value">${orderData.userName} (${orderData.userEmail})</div>
            </div>
            <div class="section">
              <div class="label">Order Details</div>
              <table>
                <thead><tr><th>Item</th><th style="text-align:right">Total</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
              </table>
            </div>
            <div class="section">
              <div class="label">Shipping Address</div>
              <div class="address-box">
                <p style="font-size:15px;color:#2C3E2D;">${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}</p>
                <p style="font-size:14px;color:#2C3E2D;">${orderData.shippingAddress.street}</p>
                <p style="font-size:14px;color:#2C3E2D;">${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.postalCode}</p>
                <p style="font-size:14px;color:#2C3E2D;">${orderData.shippingAddress.country}</p>
              </div>
            </div>
            <div class="section">
              <div class="summary-row"><span>Subtotal</span><span>$${orderData.subtotal.toFixed(2)}</span></div>
              <div class="summary-row"><span>Shipping</span><span>${orderData.shippingCost === 0 ? 'Free' : '$' + orderData.shippingCost.toFixed(2)}</span></div>
              ${orderData.discount > 0 ? `<div class="summary-row"><span>Discount</span><span>-$${orderData.discount.toFixed(2)}</span></div>` : ''}
              <div class="summary-row total"><span>Total</span><span>$${orderData.total.toFixed(2)}</span></div>
            </div>
            <div class="gold-line"></div>
            <div class="footer">
              Payment Method: ${paymentMethodName}<br>
              Status: ${orderData.orderStatus}<br>
              The GlowTeva Team
            </div>
          </div>
        </body>
      </html>
    `;
        return this.sendEmail({
            to: index_js_1.config.adminEmail,
            subject: `New Order ${orderData.orderNumber} - ${orderData.userName}`,
            html: adminHtml,
        });
    }
    async sendNewsletterWelcome(subscriberEmail, adminEmail) {
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
              <div class="tagline">Welcome to the Family</div>
            </div>
            <div class="content">
              <p>Dear valued customer,</p>
              <p>Thank you for subscribing to the GlowTeva newsletter! You'll receive exclusive offers, skincare rituals, and ingredient insights directly in your inbox.</p>
              <p>Explore our <a href="${index_js_1.config.clientUrl}/shop" style="color: #C5A46E;">latest collections</a> or read our <a href="${index_js_1.config.clientUrl}/journal" style="color: #C5A46E;">journal</a> for skincare tips.</p>
            </div>
            <div class="gold-line"></div>
            <div class="footer">
              With botanical care,<br>The GlowTeva Team
            </div>
          </div>
        </body>
      </html>
    `;
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
            .footer { text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #DED7CC; color: #4A5D4E; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">GLOWTEVA</div>
              <div class="tagline">New Newsletter Subscriber</div>
            </div>
            <div class="field">
              <div class="label">Subscriber Email</div>
              <div class="value">${subscriberEmail}</div>
            </div>
            <div class="footer">
              Sent from GlowTeva Organics Newsletter
            </div>
          </div>
        </body>
      </html>
    `;
        await this.sendEmail({
            to: subscriberEmail,
            subject: 'Welcome to GlowTeva Newsletter',
            html: userHtml,
        });
        return this.sendEmail({
            to: adminEmail,
            subject: 'New Newsletter Subscriber - GlowTeva',
            html: adminHtml,
        });
    }
    async sendNewsletterAdminNotification(subscriberEmail) {
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
            .footer { text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #DED7CC; color: #4A5D4E; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">GLOWTEVA</div>
              <div class="tagline">New Newsletter Subscriber</div>
            </div>
            <div class="field">
              <div class="label">Subscriber Email</div>
              <div class="value">${subscriberEmail}</div>
            </div>
            <div class="footer">
              Sent from GlowTeva Organics Newsletter
            </div>
          </div>
        </body>
      </html>
    `;
        return this.sendEmail({
            to: index_js_1.config.adminEmail,
            subject: 'New Newsletter Subscriber - GlowTeva',
            html: adminHtml,
        });
    }
}
exports.emailService = new EmailService();
//# sourceMappingURL=emailService.js.map