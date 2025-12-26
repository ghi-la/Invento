import fs from 'node:fs';
import path from 'node:path';

// Resolve logs directory at backend/logs regardless of build output location
const LOGS_DIR = path.resolve(process.cwd(), 'logs');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function getDateStamp(date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getLogFilePath(date = new Date()): string {
  const filename = `${getDateStamp(date)}.log`;
  return path.join(LOGS_DIR, filename);
}

function appendLine(line: string): void {
  const filePath = getLogFilePath();
  try {
    fs.appendFileSync(filePath, line + '\n', { encoding: 'utf8' });
  } catch (err) {
    // Fallback to console if file writing fails
    console.error('Failed to write log file:', err);
  }
}

export function requestLogger(
  req: {
    ip: any;
    method: any;
    originalUrl: any;
    headers?: Record<string, any>;
  },
  _res: any,
  next: () => void
) {
  const now = new Date();
  const line = `[${now.toISOString()}]\t${req.ip}\t${req.method}\t${
    req.originalUrl
  }`;

  // Write to console
  console.log(line);

  // Also append to daily log file
  appendLine(line);

  next();
}

// Optional generic logger for app-level messages
export const logger = {
  info(message: string, meta?: Record<string, any>) {
    const line =
      `[${new Date().toISOString()}] INFO ${message}` +
      (meta ? ` ${JSON.stringify(meta)}` : '');
    console.log(line);
    appendLine(line);
  },
  warn(message: string, meta?: Record<string, any>) {
    const line =
      `[${new Date().toISOString()}] WARN ${message}` +
      (meta ? ` ${JSON.stringify(meta)}` : '');
    console.warn(line);
    appendLine(line);
  },
  error(message: string, meta?: Record<string, any>) {
    const line =
      `[${new Date().toISOString()}] ERROR ${message}` +
      (meta ? ` ${JSON.stringify(meta)}` : '');
    console.error(line);
    appendLine(line);
  },
  debug(message: string, meta?: Record<string, any>) {
    const line =
      `[${new Date().toISOString()}] DEBUG ${message}` +
      (meta ? ` ${JSON.stringify(meta)}` : '');
    if (process.env.NODE_ENV !== 'production') {
      console.debug(line);
    }
    appendLine(line);
  },
};
