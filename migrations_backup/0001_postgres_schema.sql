-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL UNIQUE,
	"password" text NOT NULL,
	"name" text,
	"email" text,
	"currency" text DEFAULT 'USD',
	"categories" text DEFAULT 'Food,Transport,Entertainment,Shopping,Bills,Healthcare,Education'
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS "budgets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category" text NOT NULL,
	"limit" real NOT NULL,
	"created_at" bigint NOT NULL,
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS "expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"amount" real NOT NULL,
	"category" text NOT NULL,
	"date" text NOT NULL,
	"notes" text,
	"created_at" bigint NOT NULL,
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create loans table
CREATE TABLE IF NOT EXISTS "loans" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"total_amount" real NOT NULL,
	"paid_amount" real DEFAULT 0 NOT NULL,
	"interest_rate" real NOT NULL,
	"due_date" text NOT NULL,
	"lender" text NOT NULL,
	"type" text NOT NULL,
	"created_at" bigint NOT NULL,
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create loan_payments table
CREATE TABLE IF NOT EXISTS "loan_payments" (
	"id" text PRIMARY KEY NOT NULL,
	"loan_id" text NOT NULL,
	"amount" real NOT NULL,
	"date" text NOT NULL,
	"notes" text,
	"created_at" bigint NOT NULL,
	FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE CASCADE
);

-- Create business_transactions table
CREATE TABLE IF NOT EXISTS "business_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" text NOT NULL,
	"type" text NOT NULL,
	"amount" real NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"payment_method" text NOT NULL,
	"custom_fields" text,
	"created_at" bigint NOT NULL,
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create custom_fields table
CREATE TABLE IF NOT EXISTS "custom_fields" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"options" text,
	"created_at" bigint NOT NULL,
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_budgets_user_id" ON "budgets"("user_id");
CREATE INDEX IF NOT EXISTS "idx_expenses_user_id" ON "expenses"("user_id");
CREATE INDEX IF NOT EXISTS "idx_loans_user_id" ON "loans"("user_id");
CREATE INDEX IF NOT EXISTS "idx_loan_payments_loan_id" ON "loan_payments"("loan_id");
CREATE INDEX IF NOT EXISTS "idx_business_transactions_user_id" ON "business_transactions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_custom_fields_user_id" ON "custom_fields"("user_id");
