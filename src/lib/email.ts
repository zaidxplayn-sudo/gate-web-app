import nodemailer from "nodemailer";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

// In production, configure SMTP via environment variables.
// When SMTP is not configured, the message is logged so the flow is still verifiable in development.
function getTransporter() {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(
      `[email:dev-fallback] Would send email to ${payload.to}\nSubject: ${payload.subject}\n${payload.text ?? payload.html}`
    );
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "Gate <no-reply@drzgate.com>",
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });
}
