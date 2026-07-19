const nodemailer = require('nodemailer');

let transporterPromise;

async function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = (async () => {
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    })();
  }

  return transporterPromise;
}

function getFrontendUrl() {
  return process.env.FRONTEND_URL || 'http://localhost:3000';
}

async function sendVerificationEmail(to, token) {
  const transporter = await getTransporter();
  const confirmUrl = `${getFrontendUrl()}/verify-email?token=${token}`;

  const info = await transporter.sendMail({
    from: 'YUMA E-commerce <no-reply@yuma.local>',
    to,
    subject: 'Confirm your YUMA account email',
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">Welcome to YUMA</h2>
        <p style="margin-top: 0;">Thanks for signing up. Please confirm your email to activate your account.</p>
        <a
          href="${confirmUrl}"
          style="display: inline-block; margin-top: 8px; background: #ea580c; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 6px; font-weight: 600;"
        >
          Confirm Email
        </a>
        <p style="margin-top: 16px; font-size: 12px; color: #6b7280;">
          If the button does not work, copy and paste this URL into your browser:<br />
          ${confirmUrl}
        </p>
      </div>
    `
  });

  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info)
  };
}

async function sendPasswordResetEmail(to, token) {
  const transporter = await getTransporter();
  const resetUrl = `${getFrontendUrl()}/reset-password?token=${token}`;

  const info = await transporter.sendMail({
    from: 'YUMA E-commerce <no-reply@yuma.local>',
    to,
    subject: 'Reset your YUMA password',
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">Password reset request</h2>
        <p style="margin-top: 0;">We received a request to reset your password.</p>
        <a
          href="${resetUrl}"
          style="display: inline-block; margin-top: 8px; background: #991b1b; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 6px; font-weight: 600;"
        >
          Reset Password
        </a>
        <p style="margin-top: 16px; font-size: 12px; color: #6b7280;">
          If you did not request this, you can ignore this email. This link expires in 1 hour.<br />
          ${resetUrl}
        </p>
      </div>
    `
  });

  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info)
  };
}

async function sendOrderConfirmationEmail(to, orderDetails) {
  const transporter = await getTransporter();

  const itemsHtml = orderDetails.items
    .map((item) => {
      const lineTotal = Number(item.lineTotal || 0).toFixed(2);
      const unitPrice = Number(item.unitPrice || 0).toFixed(2);
      return `
        <tr>
          <td style="padding: 6px 0;">${item.name}</td>
          <td style="padding: 6px 0; text-align: center;">${item.quantity}</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 600;">EUR ${lineTotal}</td>
        </tr>
      `;
    })
    .join('');

  const info = await transporter.sendMail({
    from: 'YUMA E-commerce <no-reply@yuma.local>',
    to,
    subject: `YUMA Order Confirmation ${orderDetails.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">Thank you for shopping with YUMA</h2>
        <p style="margin-top: 0;">Your order has been received and is now pending confirmation.</p>

        <p style="margin: 12px 0 4px;"><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
        <p style="margin: 0 0 4px;"><strong>Order Type:</strong> ${orderDetails.orderType}</p>
        <p style="margin: 0 0 4px;"><strong>Contact Phone:</strong> ${orderDetails.phone || '-'}</p>
        <p style="margin: 0 0 4px;"><strong>Fulfillment Details:</strong> ${orderDetails.shippingAddress || '-'}</p>
        <p style="margin: 0 0 4px;"><strong>Subtotal:</strong> EUR ${Number(orderDetails.subtotal || 0).toFixed(2)}</p>
        <p style="margin: 0 0 4px;"><strong>Delivery Fee:</strong> EUR ${Number(orderDetails.deliveryFee || 0).toFixed(2)}</p>
        <p style="margin: 0 0 12px;"><strong>Total:</strong> EUR ${Number(orderDetails.totalAmount || 0).toFixed(2)}</p>

        <table style="width: 100%; border-collapse: collapse; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; margin: 8px 0 12px;">
          <thead>
            <tr style="text-align: left; color: #6b7280; font-size: 12px;">
              <th style="padding: 8px 0;">Item</th>
              <th style="padding: 8px 0; text-align: center;">Qty</th>
              <th style="padding: 8px 0; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <p style="margin-top: 0; font-size: 13px; color: #4b5563;">
          Tax is already included in product prices. Delivery fee and free-delivery rules are applied from current store settings.
        </p>
      </div>
    `
  });

  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info)
  };
}

async function sendOrderStatusUpdateEmail(to, orderDetails) {
  const transporter = await getTransporter();
  const orderUrl = `${getFrontendUrl()}/success?orderNumber=${encodeURIComponent(orderDetails.orderNumber || '')}`;

  const info = await transporter.sendMail({
    from: 'YUMA E-commerce <no-reply@yuma.local>',
    to,
    subject: `YUMA Order ${orderDetails.orderNumber} status updated to ${orderDetails.status}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">Order Status Update</h2>
        <p style="margin-top: 0;">Your order status has been updated.</p>

        <p style="margin: 12px 0 4px;"><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
        <p style="margin: 0 0 4px;"><strong>New Status:</strong> ${orderDetails.status}</p>
        <p style="margin: 0 0 4px;"><strong>Order Type:</strong> ${orderDetails.orderType || '-'}</p>
        <p style="margin: 0 0 12px;"><strong>Total:</strong> EUR ${Number(orderDetails.totalAmount || 0).toFixed(2)}</p>

        <a
          href="${orderUrl}"
          style="display: inline-block; margin-top: 8px; background: #991b1b; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 6px; font-weight: 600;"
        >
          View Order
        </a>

        <p style="margin-top: 16px; font-size: 12px; color: #6b7280;">
          If the button does not work, copy and paste this URL into your browser:<br />
          ${orderUrl}
        </p>
      </div>
    `
  });

  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info)
  };
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail
};
