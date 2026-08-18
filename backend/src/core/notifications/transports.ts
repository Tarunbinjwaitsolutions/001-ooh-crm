import { config } from '../../config/index.js';
import type { EmailMessage, EmailTransport } from './types.js';

/**
 * Development transport. Prints the email to the server log instead of sending it,
 * so nobody needs an email provider account to log in locally.
 */
export const consoleTransport: EmailTransport = {
  name: 'console',
  async send(message: EmailMessage) {
    console.log(
      [
        '',
        '┌─────────────────────────────────────────────────────────────',
        '│ EMAIL (dev transport — not actually sent)',
        `│ To:      ${message.to}`,
        `│ Subject: ${message.subject}`,
        '├─────────────────────────────────────────────────────────────',
        ...message.text.split('\n').map((line) => `│ ${line}`),
        '└─────────────────────────────────────────────────────────────',
        '',
      ].join('\n'),
    );
  },
};

/**
 * Real email transport — NOT WIRED UP YET.
 *
 * When the client's email provider account and domain verification land
 * (Resend / SES / Postmark — never VPS SMTP, OTP mail lands in spam and blocks
 * logins), implement `send` here and set `OTP_DELIVERY=email` in the environment.
 * Nothing else in the codebase has to change: the auth service already talks to
 * this interface, and `OTP_EXPOSE_IN_RESPONSE` is force-disabled in production.
 */
export const emailTransport: EmailTransport = {
  name: config.email.provider || 'email',
  async send() {
    throw new Error(
      'Email transport is not implemented yet. Set OTP_DELIVERY=console for local development, ' +
        'or implement emailTransport in core/notifications/transports.ts.',
    );
  },
};

export function resolveTransport(): EmailTransport {
  return config.otp.delivery === 'email' ? emailTransport : consoleTransport;
}
