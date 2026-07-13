import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const currentDir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(currentDir, '../../.env');

const loadEnvFile = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
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

export const getEmailCredentials = () => {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error('Email credentials are not configured. Set EMAIL_USER and EMAIL_PASS (or SMTP_USER/SMTP_PASS).');
  }

  return { user, pass };
};

export const getEmailFromAddress = () => getEmailCredentials().user;

export const createEmailTransport = () => {
  const { user, pass } = getEmailCredentials();

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || process.env.SMTP_SERVICE || 'gmail',
    auth: {
      user,
      pass,
    },
  });
};
