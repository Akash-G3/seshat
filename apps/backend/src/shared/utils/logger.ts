import { env } from '../../config/env.js';
import { EApplicationEnvironment } from '../../constants/application';
import util from 'node:util';
import path from 'node:path';
import { createLogger, format, transports } from 'winston';
import { ConsoleTransportInstance, FileTransportInstance } from 'winston/lib/winston/transports';
import { red, blue, yellow, green, magenta } from 'colorette';
import * as sourceMapSupport from 'source-map-support';

sourceMapSupport.install();

const colorizeLevel = (level: string) => {
  switch (level.toUpperCase()) {
    case 'ERROR':
      return red(level.toUpperCase());
    case 'WARN':
      return yellow(level.toUpperCase());
    case 'INFO':
      return blue(level.toUpperCase());
    default:
      return level.toUpperCase();
  }
};

const serialize = (value: unknown): unknown => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack ?? null,
      ...(value.cause !== undefined ? { cause: serialize(value.cause) } : {}),
    };
  }

  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) return value.map(serialize);

  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      output[key] = serialize(item);
    }
    return output;
  }

  return value;
};

const getMeta = (info: Record<string, unknown>) => {
  const excluded = new Set([
    'level',
    'message',
    'timestamp',
    Symbol.for('level'),
    Symbol.for('message'),
  ]);
  const meta: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(info)) {
    if (!excluded.has(key)) meta[key] = value;
  }

  // Avoid the old nested `defaultMeta: { meta: {} }` shape while remaining
  // compatible with existing calls such as logger.error('...', { meta: ... }).
  if (meta.meta && typeof meta.meta === 'object') {
    const nested = meta.meta as Record<string, unknown>;
    delete meta.meta;
    Object.assign(meta, nested);
  }

  return serialize(meta) as Record<string, unknown>;
};

const consoleLogFormat = format.printf((info) => {
  const timestamp = String(info.timestamp ?? new Date().toISOString());
  const level = colorizeLevel(String(info.level));
  const message = String(info.message ?? '');
  const meta = getMeta(info);

  const metaText = util.inspect(meta, {
    depth: null,
    colors: true,
    compact: false,
    maxArrayLength: null,
    maxStringLength: null,
    breakLength: 120,
  });

  return `${level} [${green(timestamp)}] ${message}\n${magenta('META')} ${metaText}\n`;
});

const jsonLogFormat = format.printf((info) => {
  const meta = getMeta(info);

  return JSON.stringify({
    timestamp: info.timestamp,
    level: String(info.level).toLowerCase(),
    message: info.message,
    ...meta,
  });
});

const consoleTransport = (): Array<ConsoleTransportInstance> => {
  if (env.NODE_ENV === EApplicationEnvironment.DEVELOPMENT) {
    return [
      new transports.Console({
        level: 'info',
        format: format.combine(
          format.timestamp(),
          format.errors({ stack: true }),
          consoleLogFormat
        ),
      }),
    ];
  }

  return [];
};

const fileTransport = (): Array<FileTransportInstance> => [
  new transports.File({
    filename: path.join(__dirname, '../', '../', '../', 'logs', `${env.NODE_ENV}.log`),
    level: 'info',
    format: format.combine(format.timestamp(), format.errors({ stack: true }), jsonLogFormat),
  }),
];

export default createLogger({
  transports: [...fileTransport(), ...consoleTransport()],
});
