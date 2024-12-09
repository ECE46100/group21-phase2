import winston, { log } from 'winston';
import { Request, Response, NextFunction } from 'express';

const customFormat = winston.format.printf(({ level , message, timestamp }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

/**
 * Logger for the application
 */
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    // winston.format.colorize(),
    customFormat
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/app.log', options: { flags: 'w' } }),
  ]
});

/**
 * utility for logging requests in the express app
 * @param req : Request
 * @param res : Response
 * @param next : NextFunction (it's a middleware)
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  res.on('finish', () => {
    logger.info(`${req.method} ${req.path} ${res.statusCode}`);
  });
  next();
}