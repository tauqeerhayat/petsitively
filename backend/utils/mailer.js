const nodemailer = require('nodemailer');

function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');

  if (!user || !pass) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be set in environment variables');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

function formatMoney(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

function buildOrderEmailHtml(order) {
  const shortId = String(order._id).slice(-8).toUpperCase();
  const rows = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${item.name} × ${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${formatMoney(item.price * item.quantity)}</td>
      </tr>`
    )
    .join('');

  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1c2b22;">
    <h1 style="color:#1f6b4a;font-size:22px;">Thanks for your order, ${order.customerName}!</h1>
    <p>We've received your Petsitively order <strong>#${shortId}</strong>.</p>
    <p><strong>Shipping to:</strong><br/>${order.shippingAddress}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr>
          <th style="text-align:left;padding-bottom:8px;border-bottom:2px solid #1f6b4a;">Item</th>
          <th style="text-align:right;padding-bottom:8px;border-bottom:2px solid #1f6b4a;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <p style="font-size:18px;"><strong>Total: ${formatMoney(order.totalAmount)}</strong></p>
    <p style="color:#5a6b61;">Payment status: ${order.paymentStatus || 'pending'}</p>
    <p style="color:#5a6b61;font-size:13px;">Most orders arrive within 7–15 business days. Reply to this email if you need help.</p>
    <p style="margin-top:24px;">— The Petsitively team</p>
  </div>`;
}

function buildOrderEmailText(order) {
  const shortId = String(order._id).slice(-8).toUpperCase();
  const lines = (order.items || []).map(
    (item) => `- ${item.name} × ${item.quantity}: ${formatMoney(item.price * item.quantity)}`
  );

  return [
    `Thanks for your order, ${order.customerName}!`,
    `Order #${shortId}`,
    '',
    `Shipping to: ${order.shippingAddress}`,
    '',
    'Items:',
    ...lines,
    '',
    `Total: ${formatMoney(order.totalAmount)}`,
    `Payment status: ${order.paymentStatus || 'pending'}`,
    '',
    'Most orders arrive within 7–15 business days.',
    '— The Petsitively team',
  ].join('\n');
}

async function sendOrderConfirmationEmail(order) {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || `Petsitively <${process.env.EMAIL_USER}>`;
  const shortId = String(order._id).slice(-8).toUpperCase();

  const info = await transporter.sendMail({
    from,
    to: order.email,
    subject: `Order confirmed #${shortId} — Petsitively`,
    text: buildOrderEmailText(order),
    html: buildOrderEmailHtml(order),
  });

  return info;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildContactReplyHtml({ name, replyText, originalMessage }) {
  const safeName = escapeHtml(name);
  const safeReply = escapeHtml(replyText).replace(/\n/g, '<br/>');
  const safeOriginal = escapeHtml(originalMessage).replace(/\n/g, '<br/>');

  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1c2b22;">
    <h1 style="color:#1f6b4a;font-size:22px;">Hi ${safeName},</h1>
    <p>Thanks for contacting Petsitively. Here's our reply:</p>
    <div style="padding:14px 16px;background:#e5f0e9;border-radius:10px;margin:16px 0;line-height:1.55;">
      ${safeReply}
    </div>
    <p style="color:#5a6b61;font-size:13px;margin:24px 0 8px;">Your original message:</p>
    <blockquote style="margin:0;padding:12px 14px;border-left:3px solid #1f6b4a;background:#f3f7f4;color:#5a6b61;line-height:1.55;">
      ${safeOriginal}
    </blockquote>
    <p style="margin-top:24px;">— The Petsitively team</p>
  </div>`;
}

function buildContactReplyText({ name, replyText, originalMessage }) {
  return [
    `Hi ${name},`,
    '',
    "Thanks for contacting Petsitively. Here's our reply:",
    '',
    replyText,
    '',
    '---',
    'Your original message:',
    originalMessage,
    '',
    '— The Petsitively team',
  ].join('\n');
}

async function sendContactReplyEmail({ name, email, replyText, originalMessage }) {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || `Petsitively <${process.env.EMAIL_USER}>`;

  const info = await transporter.sendMail({
    from,
    to: email,
    subject: 'Re: Your message to Petsitively',
    text: buildContactReplyText({ name, replyText, originalMessage }),
    html: buildContactReplyHtml({ name, replyText, originalMessage }),
  });

  return info;
}

function buildPasswordResetHtml({ name, resetUrl }) {
  const safeName = escapeHtml(name);

  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1c2b22;">
    <h1 style="color:#1f6b4a;font-size:22px;">Reset your password</h1>
    <p>Hi ${safeName},</p>
    <p>We received a request to reset your Petsitively account password. Click the button below to choose a new one. This link expires in 1 hour.</p>
    <p style="margin:28px 0;">
      <a href="${resetUrl}" style="display:inline-block;padding:12px 22px;background:#1f6b4a;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
        Reset password
      </a>
    </p>
    <p style="color:#5a6b61;font-size:13px;">If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="color:#5a6b61;font-size:13px;word-break:break-all;">${escapeHtml(resetUrl)}</p>
    <p style="color:#5a6b61;font-size:13px;">If you didn't request this, you can ignore this email.</p>
    <p style="margin-top:24px;">— The Petsitively team</p>
  </div>`;
}

function buildPasswordResetText({ name, resetUrl }) {
  return [
    `Hi ${name},`,
    '',
    'We received a request to reset your Petsitively account password.',
    'Open the link below to choose a new one. This link expires in 1 hour.',
    '',
    resetUrl,
    '',
    "If you didn't request this, you can ignore this email.",
    '',
    '— The Petsitively team',
  ].join('\n');
}

async function sendPasswordResetEmail({ name, email, resetUrl }) {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || `Petsitively <${process.env.EMAIL_USER}>`;

  const info = await transporter.sendMail({
    from,
    to: email,
    subject: 'Reset your Petsitively password',
    text: buildPasswordResetText({ name, resetUrl }),
    html: buildPasswordResetHtml({ name, resetUrl }),
  });

  return info;
}

module.exports = {
  sendOrderConfirmationEmail,
  sendContactReplyEmail,
  sendPasswordResetEmail,
};
