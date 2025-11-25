const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors, but sanitize in production
    if (isDevelopment) {
      console.error(...args);
    } else {
      // In production, log to your logging service (Sentry, etc.)
      // For now, we'll still log errors but without sensitive data
      console.error(...args.map(arg => {
        if (typeof arg === 'string' && (arg.includes('password') || arg.includes('secret') || arg.includes('token'))) {
          return '[REDACTED]';
        }
        return arg;
      }));
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
};

