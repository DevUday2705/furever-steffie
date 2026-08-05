import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';

const currentDir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(currentDir, '../../.env');

const loadEnvFile = () => {
  if (process.env.RESEND_API_KEY) {
    return;
  }

  try {
    const envContents = readFileSync(envPath, 'utf8');
    for (const line of envContents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // Ignore missing env file and rely on deployment environment variables.
  }
};

loadEnvFile();

export const getResendApiKey = () => {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    throw new Error('Resend API key is not configured. Set RESEND_API_KEY.');
  }

  return key;
};

export const getEmailFromAddress = () => {
  const fromAddress = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || process.env.EMAIL_USER;

  if (!fromAddress) {
    throw new Error('Sender address is not configured. Set RESEND_FROM_EMAIL (or EMAIL_FROM).');
  }

  return fromAddress;
};

const getAddressValue = (addressInput) => {
  if (!addressInput) return undefined;
  if (typeof addressInput === 'string') return addressInput;
  if (typeof addressInput === 'object' && addressInput.address) {
    return addressInput.name ? `${addressInput.name} <${addressInput.address}>` : addressInput.address;
  }
  return undefined;
};

const toAddressArray = (addressInput) => {
  if (!addressInput) return [];
  const values = Array.isArray(addressInput) ? addressInput : [addressInput];
  return values.map(getAddressValue).filter(Boolean);
};

export const createEmailTransport = () => {
  const resend = new Resend(getResendApiKey());

  return {
    async sendMail(mailOptions) {
      const from = getAddressValue(mailOptions?.from) || getEmailFromAddress();
      const to = toAddressArray(mailOptions?.to);

      if (to.length === 0) {
        throw new Error('Recipient address is missing in mail options.');
      }

      const payload = {
        from,
        to,
        subject: mailOptions?.subject,
        html: mailOptions?.html,
        text: mailOptions?.text,
        cc: toAddressArray(mailOptions?.cc),
        bcc: toAddressArray(mailOptions?.bcc),
        replyTo: getAddressValue(mailOptions?.replyTo),
      };

      const { data, error } = await resend.emails.send(payload);

      if (error) {
        throw new Error(error.message || 'Resend failed to send email.');
      }

      return {
        messageId: data?.id,
        data,
      };
    },
  };
};
