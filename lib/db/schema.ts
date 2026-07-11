import {
  pgTable,
  serial,
  varchar,
  text,
  smallint,
  integer,
  numeric,
  date,
  timestamp,
  jsonb,
  unique,
  index,
} from 'drizzle-orm/pg-core';

export const symbols = pgTable(
  'symbols',
  {
    symbol: varchar('symbol', { length: 10 }).primaryKey(),
    name: text('name').notNull().default(''),
    sector: text('sector'),
    industry: text('industry'),
  },
  (t) => [
    index('symbols_sector_idx').on(t.sector),
    index('symbols_sector_industry_idx').on(t.sector, t.industry),
  ]
);

export const symbolData = pgTable(
  'symbol_data',
  {
    symbol: varchar('symbol', { length: 10 }).notNull(),
    date: date('date').notNull(),
    eod: numeric('eod', { precision: 10, scale: 2 }).notNull(),
    ma20: numeric('ma20', { precision: 10, scale: 2 }),
    ma50: numeric('ma50', { precision: 10, scale: 2 }),
    delta: numeric('delta', { precision: 10, scale: 2 }),
    deltaMa5: numeric('delta_ma5', { precision: 10, scale: 2 }),
    deltaMa10: numeric('delta_ma10', { precision: 10, scale: 2 }),
    deltaMa20: numeric('delta_ma20', { precision: 10, scale: 2 }),
    m1: numeric('m1', { precision: 10, scale: 2 }),
    m2: numeric('m2', { precision: 10, scale: 2 }),
    m3: numeric('m3', { precision: 10, scale: 2 }),
    p0: smallint('p0').notNull().default(0),
    p1: smallint('p1').notNull().default(0),
    p2: smallint('p2').notNull().default(0),
  },
  (t) => [
    unique('symbol_data_pk').on(t.symbol, t.date),
    index('symbol_data_symbol_date_idx').on(t.symbol, t.date),
  ]
);

export const alerts = pgTable(
  'alerts',
  {
    id: serial('id').primaryKey(),
    date: date('date').notNull(),
    symbol: varchar('symbol', { length: 10 }).notNull(),
    type: varchar('type', { length: 20 }).notNull(),
  },
  (t) => [unique('alerts_date_symbol_type_key').on(t.date, t.symbol, t.type)]
);

export const track = pgTable(
  'track',
  {
    symbol: varchar('symbol', { length: 10 }).notNull(),
    userId: varchar('user_id', { length: 255 }).notNull(),
  },
  (t) => [unique('track_symbol_user_key').on(t.symbol, t.userId)]
);

export const applicationReports = pgTable('application_reports', {
  id: serial('id').primaryKey(),
  stid: varchar('stid', { length: 36 }).notNull(),
  userid: smallint('userid'),
  reportType: varchar('report_type', { length: 20 }).notNull(),
  component: varchar('component', { length: 255 }),
  message: text('message'),
  timestamp: timestamp('timestamp', { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow(),
  performanceMetrics: jsonb('performance_metrics'),
  userAgent: text('user_agent'),
  viewportWidth: integer('viewport_width'),
  viewportHeight: integer('viewport_height'),
  pageUrl: text('page_url'),
  referrer: text('referrer'),
  requestData: jsonb('request_data'),
  responseData: jsonb('response_data'),
  stackTrace: text('stack_trace'),
  metadata: jsonb('metadata'),
});

export type Symbol = typeof symbols.$inferSelect;
export type SymbolData = typeof symbolData.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type Track = typeof track.$inferSelect;
export type ApplicationReport = typeof applicationReports.$inferSelect;
