var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";
import cors from "cors";
import session from "express-session";
import pgSession from "connect-pg-simple";
import pg from "pg";
import fs2 from "fs";
import path3 from "path";
import { fileURLToPath } from "url";

// server/routes.ts
import { createServer } from "http";

// server/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  budgets: () => budgets,
  businessTransactions: () => businessTransactions,
  customFields: () => customFields,
  insertBudgetSchema: () => insertBudgetSchema,
  insertBusinessTransactionSchema: () => insertBusinessTransactionSchema,
  insertCustomFieldSchema: () => insertCustomFieldSchema,
  insertLoanPaymentSchema: () => insertLoanPaymentSchema,
  insertLoanSchema: () => insertLoanSchema,
  insertUserSchema: () => insertUserSchema,
  loanPayments: () => loanPayments,
  loans: () => loans,
  updatePasswordSchema: () => updatePasswordSchema,
  updateUserSchema: () => updateUserSchema,
  users: () => users
});
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  currency: text("currency").default("USD"),
  categories: text("categories").default("Food,Transport,Entertainment,Shopping,Bills,Healthcare,Education")
});
var budgets = sqliteTable("budgets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  limit: real("limit").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});
var loans = sqliteTable("loans", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  totalAmount: real("total_amount").notNull(),
  paidAmount: real("paid_amount").notNull().default(0),
  interestRate: real("interest_rate").notNull(),
  dueDate: text("due_date").notNull(),
  lender: text("lender").notNull(),
  type: text("type").notNull(),
  // personal, business, auto, mortgage
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});
var loanPayments = sqliteTable("loan_payments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  loanId: text("loan_id").notNull().references(() => loans.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  date: text("date").notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});
var businessTransactions = sqliteTable("business_transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  type: text("type").notNull(),
  // income or expense
  amount: real("amount").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  paymentMethod: text("payment_method").notNull(),
  customFields: text("custom_fields", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});
var customFields = sqliteTable("custom_fields", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  // text, number, date, select
  options: text("options", { mode: "json" }),
  // for select type
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true
});
var updateUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  currency: true
}).partial().extend({
  categories: z.array(z.string()).optional()
});
var updatePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6, "Password must be at least 6 characters")
});
var insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  createdAt: true
});
var insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
  createdAt: true
});
var insertLoanPaymentSchema = createInsertSchema(loanPayments).omit({
  id: true,
  createdAt: true
});
var insertBusinessTransactionSchema = createInsertSchema(businessTransactions).omit({
  id: true,
  createdAt: true
});
var insertCustomFieldSchema = createInsertSchema(customFields).omit({
  id: true,
  createdAt: true
});

// server/db.ts
import dotenv from "dotenv";
dotenv.config();
var databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}
console.log("\u{1F4BE} Connecting to PostgreSQL database");
var client = postgres(databaseUrl);
var db = drizzle(client, { schema: schema_exports });

// server/storage.ts
import { eq, desc } from "drizzle-orm";
var DatabaseStorage = class {
  // User methods
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  async getUserByUsername(username) {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }
  async createUser(insertUser) {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  async updateUser(id, user) {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }
  async updateUserPassword(id, hashedPassword) {
    const result = await db.update(users).set({ password: hashedPassword }).where(eq(users.id, id)).returning();
    return result.length > 0;
  }
  // Budget methods
  async getBudgets(userId) {
    return await db.select().from(budgets).where(eq(budgets.userId, userId));
  }
  async getBudget(id) {
    const result = await db.select().from(budgets).where(eq(budgets.id, id)).limit(1);
    return result[0];
  }
  async createBudget(budget) {
    const result = await db.insert(budgets).values(budget).returning();
    return result[0];
  }
  async updateBudget(id, budget) {
    const result = await db.update(budgets).set(budget).where(eq(budgets.id, id)).returning();
    return result[0];
  }
  async deleteBudget(id) {
    const result = await db.delete(budgets).where(eq(budgets.id, id)).returning();
    return result.length > 0;
  }
  // Loan methods
  async getLoans(userId) {
    return await db.select().from(loans).where(eq(loans.userId, userId)).orderBy(desc(loans.createdAt));
  }
  async getLoan(id) {
    const result = await db.select().from(loans).where(eq(loans.id, id)).limit(1);
    return result[0];
  }
  async createLoan(loan) {
    const result = await db.insert(loans).values(loan).returning();
    return result[0];
  }
  async updateLoan(id, loan) {
    const result = await db.update(loans).set(loan).where(eq(loans.id, id)).returning();
    return result[0];
  }
  async deleteLoan(id) {
    const result = await db.delete(loans).where(eq(loans.id, id)).returning();
    return result.length > 0;
  }
  // Loan Payment methods
  async getLoanPayments(loanId) {
    return await db.select().from(loanPayments).where(eq(loanPayments.loanId, loanId)).orderBy(desc(loanPayments.date));
  }
  async getLoanPayment(id) {
    const result = await db.select().from(loanPayments).where(eq(loanPayments.id, id)).limit(1);
    return result[0];
  }
  async createLoanPayment(payment) {
    const result = await db.insert(loanPayments).values(payment).returning();
    return result[0];
  }
  async updateLoanPayment(id, payment) {
    const result = await db.update(loanPayments).set(payment).where(eq(loanPayments.id, id)).returning();
    return result[0];
  }
  async deleteLoanPayment(id) {
    const result = await db.delete(loanPayments).where(eq(loanPayments.id, id)).returning();
    return result.length > 0;
  }
  // Business Transaction methods
  async getBusinessTransactions(userId) {
    return await db.select().from(businessTransactions).where(eq(businessTransactions.userId, userId)).orderBy(desc(businessTransactions.date));
  }
  async getBusinessTransaction(id) {
    const result = await db.select().from(businessTransactions).where(eq(businessTransactions.id, id)).limit(1);
    return result[0];
  }
  async createBusinessTransaction(transaction) {
    const result = await db.insert(businessTransactions).values(transaction).returning();
    return result[0];
  }
  async updateBusinessTransaction(id, transaction) {
    const result = await db.update(businessTransactions).set(transaction).where(eq(businessTransactions.id, id)).returning();
    return result[0];
  }
  async deleteBusinessTransaction(id) {
    const result = await db.delete(businessTransactions).where(eq(businessTransactions.id, id)).returning();
    return result.length > 0;
  }
  // Custom Field methods
  async getCustomFields(userId) {
    return await db.select().from(customFields).where(eq(customFields.userId, userId));
  }
  async createCustomField(field) {
    const result = await db.insert(customFields).values(field).returning();
    return result[0];
  }
  async updateCustomField(id, field) {
    const result = await db.update(customFields).set(field).where(eq(customFields.id, id)).returning();
    return result[0];
  }
  async deleteCustomField(id) {
    const result = await db.delete(customFields).where(eq(customFields.id, id)).returning();
    return result.length > 0;
  }
};
var storage = new DatabaseStorage();

// server/types.ts
import "express-session";

// server/routes.ts
import bcrypt from "bcrypt";
import { fromZodError } from "zod-validation-error";
var parseCategories = (categories) => {
  if (!categories) return ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Healthcare", "Education"];
  if (Array.isArray(categories)) return categories;
  if (typeof categories === "string") return categories.split(",").filter((c) => c.trim());
  return ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Healthcare", "Education"];
};
var stringifyCategories = (categories) => {
  if (!categories) return "Food,Transport,Entertainment,Shopping,Bills,Healthcare,Education";
  if (Array.isArray(categories)) return categories.join(",");
  if (typeof categories === "string") return categories;
  return "Food,Transport,Entertainment,Shopping,Bills,Healthcare,Education";
};
var requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};
async function registerRoutes(app2) {
  app2.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  });
  app2.post("/api/auth/signup", async (req, res) => {
    try {
      const parsed = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(parsed.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const hashedPassword = await bcrypt.hash(parsed.password, 10);
      const user = await storage.createUser({
        ...parsed,
        password: hashedPassword
      });
      await new Promise((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      req.session.userId = user.id;
      const { password, ...userWithoutPassword } = user;
      const userWithArrayCategories = {
        ...userWithoutPassword,
        categories: parseCategories(user.categories)
      };
      return res.status(201).json(userWithArrayCategories);
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromZodError(error).message });
      } else {
        return res.status(500).json({ message: error.message || "Internal server error" });
      }
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.regenerate((err) => {
        if (err) {
          return res.status(500).json({ message: "Session error" });
        }
        req.session.userId = user.id;
        const { password: _, ...userWithoutPassword } = user;
        const userWithArrayCategories = {
          ...userWithoutPassword,
          categories: parseCategories(user.categories)
        };
        res.json(userWithArrayCategories);
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/auth/user", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      const userWithArrayCategories = {
        ...userWithoutPassword,
        categories: parseCategories(user.categories)
      };
      res.json(userWithArrayCategories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.put("/api/auth/user", requireAuth, async (req, res) => {
    try {
      const parsed = updateUserSchema.parse(req.body);
      const dataToUpdate = {
        ...parsed,
        categories: parsed.categories ? stringifyCategories(parsed.categories) : void 0
      };
      const user = await storage.updateUser(req.session.userId, dataToUpdate);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      const userWithArrayCategories = {
        ...userWithoutPassword,
        categories: parseCategories(user.categories)
      };
      res.json(userWithArrayCategories);
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });
  app2.put("/api/auth/user/password", requireAuth, async (req, res) => {
    try {
      const parsed = updatePasswordSchema.parse(req.body);
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const validPassword = await bcrypt.compare(parsed.currentPassword, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      const hashedPassword = await bcrypt.hash(parsed.newPassword, 10);
      await storage.updateUserPassword(user.id, hashedPassword);
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });
  app2.get("/api/budgets", requireAuth, async (req, res) => {
    try {
      const budgets2 = await storage.getBudgets(req.session.userId);
      res.json(budgets2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/budgets", requireAuth, async (req, res) => {
    try {
      const parsed = insertBudgetSchema.parse({ ...req.body, userId: req.session.userId });
      const budget = await storage.createBudget(parsed);
      res.status(201).json(budget);
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });
  app2.put("/api/budgets/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const parsed = insertBudgetSchema.partial().parse(req.body);
      const budget = await storage.updateBudget(id, parsed);
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      res.json(budget);
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });
  app2.delete("/api/budgets/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBudget(id);
      if (!deleted) {
        return res.status(404).json({ message: "Budget not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/loans", requireAuth, async (req, res) => {
    try {
      const loans2 = await storage.getLoans(req.session.userId);
      res.json(loans2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/loans", requireAuth, async (req, res) => {
    try {
      const parsed = insertLoanSchema.parse({ ...req.body, userId: req.session.userId });
      const loan = await storage.createLoan(parsed);
      res.status(201).json(loan);
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });
  app2.put("/api/loans/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const parsed = insertLoanSchema.partial().parse(req.body);
      const loan = await storage.updateLoan(id, parsed);
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      res.json(loan);
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });
  app2.delete("/api/loans/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteLoan(id);
      if (!deleted) {
        return res.status(404).json({ message: "Loan not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/loans/:loanId/payments", requireAuth, async (req, res) => {
    try {
      const { loanId } = req.params;
      const payments = await storage.getLoanPayments(loanId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/loans/:loanId/payments", requireAuth, async (req, res) => {
    try {
      const { loanId } = req.params;
      const parsed = insertLoanPaymentSchema.parse({ ...req.body, loanId });
      const payment = await storage.createLoanPayment(parsed);
      const loan = await storage.getLoan(loanId);
      if (loan) {
        const newPaidAmount = Number(loan.paidAmount) + Number(parsed.amount);
        await storage.updateLoan(loanId, { paidAmount: newPaidAmount.toString() });
      }
      res.status(201).json(payment);
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });
  app2.put("/api/payments/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const existingPayment = await storage.getLoanPayment(id);
      if (!existingPayment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      const updateData = { ...req.body };
      delete updateData.loanId;
      const parsed = insertLoanPaymentSchema.partial().parse(updateData);
      const payment = await storage.updateLoanPayment(id, parsed);
      if (parsed.amount) {
        const loan = await storage.getLoan(existingPayment.loanId);
        if (loan) {
          const oldAmount = Number(existingPayment.amount);
          const newAmount = Number(parsed.amount);
          const difference = newAmount - oldAmount;
          const newPaidAmount = Number(loan.paidAmount) + difference;
          await storage.updateLoan(existingPayment.loanId, { paidAmount: newPaidAmount.toString() });
        }
      }
      res.json(payment);
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });
  app2.delete("/api/payments/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const payment = await storage.getLoanPayment(id);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      const deleted = await storage.deleteLoanPayment(id);
      if (!deleted) {
        return res.status(404).json({ message: "Payment not found" });
      }
      const loan = await storage.getLoan(payment.loanId);
      if (loan) {
        const newPaidAmount = Number(loan.paidAmount) - Number(payment.amount);
        await storage.updateLoan(payment.loanId, { paidAmount: Math.max(0, newPaidAmount).toString() });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/business-transactions", requireAuth, async (req, res) => {
    try {
      const transactions = await storage.getBusinessTransactions(req.session.userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/business-transactions", requireAuth, async (req, res) => {
    try {
      const parsed = insertBusinessTransactionSchema.parse({ ...req.body, userId: req.session.userId });
      const transaction = await storage.createBusinessTransaction(parsed);
      res.status(201).json(transaction);
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });
  app2.put("/api/business-transactions/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const parsed = insertBusinessTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateBusinessTransaction(id, parsed);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });
  app2.delete("/api/business-transactions/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBusinessTransaction(id);
      if (!deleted) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/custom-fields", requireAuth, async (req, res) => {
    try {
      const fields = await storage.getCustomFields(req.session.userId);
      res.json(fields);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/custom-fields", requireAuth, async (req, res) => {
    try {
      const parsed = insertCustomFieldSchema.parse({ ...req.body, userId: req.session.userId });
      const field = await storage.createCustomField(parsed);
      res.status(201).json(field);
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });
  app2.put("/api/custom-fields/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const parsed = insertCustomFieldSchema.partial().parse(req.body);
      const field = await storage.updateCustomField(id, parsed);
      if (!field) {
        return res.status(404).json({ message: "Custom field not found" });
      }
      res.json(field);
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });
  app2.delete("/api/custom-fields/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCustomField(id);
      if (!deleted) {
        return res.status(404).json({ message: "Custom field not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const businessTransactions2 = await storage.getBusinessTransactions(req.session.userId);
      const totalIncome = businessTransactions2.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpenses = businessTransactions2.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);
      const totalBalance = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome * 100 : 0;
      res.json({
        totalBalance,
        totalIncome,
        totalExpenses,
        savingsRate: savingsRate.toFixed(1)
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/dashboard/category-breakdown", requireAuth, async (req, res) => {
    try {
      const businessTransactions2 = await storage.getBusinessTransactions(req.session.userId);
      const categoryMap = /* @__PURE__ */ new Map();
      businessTransactions2.filter((t) => t.type === "expense").forEach((t) => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + Number(t.amount));
      });
      const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value
      }));
      res.json(categoryData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/dashboard/monthly-trend", requireAuth, async (req, res) => {
    try {
      const businessTransactions2 = await storage.getBusinessTransactions(req.session.userId);
      const monthlyMap = /* @__PURE__ */ new Map();
      businessTransactions2.filter((t) => t.type === "expense").forEach((t) => {
        const date = new Date(t.date);
        const monthKey = date.toLocaleString("en-US", { month: "short" });
        const current = monthlyMap.get(monthKey) || 0;
        monthlyMap.set(monthKey, current + Number(t.amount));
      });
      const monthlyData = Array.from(monthlyMap.entries()).map(([month, expenses]) => ({
        month,
        expenses
      }));
      res.json(monthlyData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    port: 5e3,
    strictPort: false,
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(
  cors({
    origin: true,
    // Allow all origins since they're same-origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200
  })
);
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
var databaseUrl2 = process.env.DATABASE_URL;
if (!databaseUrl2) {
  throw new Error("DATABASE_URL environment variable is not set");
}
var pool = new pg.Pool({
  connectionString: databaseUrl2
});
var __filename = fileURLToPath(import.meta.url);
var __dirname = path3.dirname(__filename);
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL,
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        PRIMARY KEY ("sid")
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);
    console.log("\u2705 Session table initialized");
    const schemaPath = path3.join(__dirname, "..", "migrations", "0001_postgres_schema.sql");
    if (fs2.existsSync(schemaPath)) {
      const schema = fs2.readFileSync(schemaPath, "utf-8");
      await pool.query(schema);
      console.log("\u2705 Database schema initialized");
    }
    const dropMigrationPath = path3.join(__dirname, "..", "migrations", "0002_drop_expenses_table.sql");
    if (fs2.existsSync(dropMigrationPath)) {
      const dropMigration = fs2.readFileSync(dropMigrationPath, "utf-8");
      await pool.query(dropMigration);
      console.log("\u2705 Database migrations applied");
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}
var PostgresSessionStore = pgSession(session);
app.use(
  session({
    store: new PostgresSessionStore({
      pool
    }),
    secret: process.env.SESSION_SECRET || "expense-tracker-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1e3,
      // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
      // Safe for same-origin deployment
    }
  })
);
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  await initializeDatabase();
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "8000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
