import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  currency: text("currency").default("USD"),
  categories: text("categories").default("Food,Transport,Entertainment,Shopping,Bills,Healthcare,Education"),
});

export const budgets = sqliteTable("budgets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  limit: real("limit").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const loans = sqliteTable("loans", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  totalAmount: real("total_amount").notNull(),
  paidAmount: real("paid_amount").notNull().default(0),
  interestRate: real("interest_rate").notNull(),
  dueDate: text("due_date").notNull(),
  lender: text("lender").notNull(),
  type: text("type").notNull(), // personal, business, auto, mortgage
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const loanPayments = sqliteTable("loan_payments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  loanId: text("loan_id").notNull().references(() => loans.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  date: text("date").notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const businessTransactions = sqliteTable("business_transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  type: text("type").notNull(), // income or expense
  amount: real("amount").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  paymentMethod: text("payment_method").notNull(),
  customFields: text("custom_fields", { mode: 'json' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const customFields = sqliteTable("custom_fields", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(), // text, number, date, select
  options: text("options", { mode: 'json' }), // for select type
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

export const updateUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  currency: true,
}).partial().extend({
  categories: z.array(z.string()).optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  createdAt: true,
});

export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
  createdAt: true,
});

export const insertLoanPaymentSchema = createInsertSchema(loanPayments).omit({
  id: true,
  createdAt: true,
});

export const insertBusinessTransactionSchema = createInsertSchema(businessTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertCustomFieldSchema = createInsertSchema(customFields).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = Omit<typeof users.$inferSelect, 'categories'> & {
  categories: string | null;
};
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UpdatePassword = z.infer<typeof updatePasswordSchema>;

export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;

export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loans.$inferSelect;

export type InsertLoanPayment = z.infer<typeof insertLoanPaymentSchema>;
export type LoanPayment = typeof loanPayments.$inferSelect;

export type InsertBusinessTransaction = z.infer<typeof insertBusinessTransactionSchema>;
export type BusinessTransaction = typeof businessTransactions.$inferSelect;

export type InsertCustomField = z.infer<typeof insertCustomFieldSchema>;
export type CustomField = typeof customFields.$inferSelect;
