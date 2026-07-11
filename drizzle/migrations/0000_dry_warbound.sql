CREATE TABLE "alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"symbol" varchar(10) NOT NULL,
	"type" varchar(20) NOT NULL,
	CONSTRAINT "alerts_date_symbol_type_key" UNIQUE("date","symbol","type")
);
--> statement-breakpoint
CREATE TABLE "application_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"stid" varchar(36) NOT NULL,
	"userid" smallint,
	"report_type" varchar(20) NOT NULL,
	"component" varchar(255),
	"message" text,
	"timestamp" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"performance_metrics" jsonb,
	"user_agent" text,
	"viewport_width" integer,
	"viewport_height" integer,
	"page_url" text,
	"referrer" text,
	"request_data" jsonb,
	"response_data" jsonb,
	"stack_trace" text,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "symbol_data" (
	"symbol" varchar(10) NOT NULL,
	"date" date NOT NULL,
	"eod" numeric(10, 2) NOT NULL,
	"ma20" numeric(10, 2),
	"ma50" numeric(10, 2),
	"delta" numeric(10, 2),
	"delta_ma5" numeric(10, 2),
	"delta_ma10" numeric(10, 2),
	"delta_ma20" numeric(10, 2),
	"m1" numeric(10, 2),
	"m2" numeric(10, 2),
	"m3" numeric(10, 2),
	"p0" smallint DEFAULT 0 NOT NULL,
	"p1" smallint DEFAULT 0 NOT NULL,
	"p2" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "symbol_data_pk" UNIQUE("symbol","date")
);
--> statement-breakpoint
CREATE TABLE "symbols" (
	"symbol" varchar(10) PRIMARY KEY NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"sector" text,
	"industry" text
);
--> statement-breakpoint
CREATE TABLE "track" (
	"symbol" varchar(10) NOT NULL,
	"user_id" varchar(255) NOT NULL,
	CONSTRAINT "track_symbol_user_key" UNIQUE("symbol","user_id")
);
--> statement-breakpoint
CREATE INDEX "symbol_data_symbol_date_idx" ON "symbol_data" USING btree ("symbol","date");--> statement-breakpoint
CREATE INDEX "symbols_sector_idx" ON "symbols" USING btree ("sector");--> statement-breakpoint
CREATE INDEX "symbols_sector_industry_idx" ON "symbols" USING btree ("sector","industry");