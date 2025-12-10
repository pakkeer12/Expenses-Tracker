import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import "./types";
import bcrypt from "bcrypt";
import {
  insertUserSchema,
  updateUserSchema,
  updatePasswordSchema,
  insertExpenseSchema,
  insertBudgetSchema,
  insertLoanSchema,
  insertLoanPaymentSchema,
  insertBusinessTransactionSchema,
  insertCustomFieldSchema,
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

// Helper functions for categories conversion
const parseCategories = (categories: string | string[] | null | undefined): string[] => {
  if (!categories) return ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Healthcare", "Education"];
  if (Array.isArray(categories)) return categories;
  if (typeof categories === 'string') return categories.split(',').filter(c => c.trim());
  return ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Healthcare", "Education"];
};

const stringifyCategories = (categories: string[] | string | null | undefined): string => {
  if (!categories) return "Food,Transport,Entertainment,Shopping,Bills,Healthcare,Education";
  if (Array.isArray(categories)) return categories.join(',');
  if (typeof categories === 'string') return categories;
  return "Food,Transport,Entertainment,Shopping,Bills,Healthcare,Education";
};

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for deployment platforms
  app.get("/api/health", (req, res) => {
    res.status(200).json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const parsed = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(parsed.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(parsed.password, 10);
      const user = await storage.createUser({
        ...parsed,
        password: hashedPassword,
      });

      // Use Promise to handle session regeneration
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      req.session.userId = user.id;
      const { password, ...userWithoutPassword } = user;
      // Convert categories string to array for the client
      const userWithArrayCategories = {
        ...userWithoutPassword,
        categories: parseCategories(user.categories)
      };
      return res.status(201).json(userWithArrayCategories);
      
    } catch (error: any) {
      // Prevent sending multiple responses by using a single error handler
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromZodError(error).message });
      } else {
        return res.status(500).json({ message: error.message || "Internal server error" });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
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
        // Convert categories string to array for the client
        const userWithArrayCategories = {
          ...userWithoutPassword,
          categories: parseCategories(user.categories)
        };
        res.json(userWithArrayCategories);
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      // Convert categories string to array for the client
      const userWithArrayCategories = {
        ...userWithoutPassword,
        categories: parseCategories(user.categories)
      };
      res.json(userWithArrayCategories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/auth/user", requireAuth, async (req, res) => {
    try {
      const parsed = updateUserSchema.parse(req.body);
      // Convert categories array to string for storage
      const dataToUpdate = {
        ...parsed,
        categories: parsed.categories ? stringifyCategories(parsed.categories) : undefined
      };
      const user = await storage.updateUser(req.session.userId!, dataToUpdate as any);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      // Convert categories string to array for the client
      const userWithArrayCategories = {
        ...userWithoutPassword,
        categories: parseCategories(user.categories)
      };
      res.json(userWithArrayCategories);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

  app.put("/api/auth/user/password", requireAuth, async (req, res) => {
    try {
      const parsed = updatePasswordSchema.parse(req.body);
      const user = await storage.getUser(req.session.userId!);
      
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
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

  // Expense routes
  app.get("/api/expenses", requireAuth, async (req, res) => {
    try {
      const expenses = await storage.getExpenses(req.session.userId!);
      res.json(expenses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/expenses", requireAuth, async (req, res) => {
    try {
      const parsed = insertExpenseSchema.parse({ ...req.body, userId: req.session.userId! });
      const expense = await storage.createExpense(parsed);
      res.status(201).json(expense);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

  app.put("/api/expenses/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const parsed = insertExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateExpense(id, parsed);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

  app.delete("/api/expenses/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteExpense(id);
      if (!deleted) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Budget routes
  app.get("/api/budgets", requireAuth, async (req, res) => {
    try {
      const budgets = await storage.getBudgets(req.session.userId!);
      res.json(budgets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/budgets", requireAuth, async (req, res) => {
    try {
      const parsed = insertBudgetSchema.parse({ ...req.body, userId: req.session.userId! });
      const budget = await storage.createBudget(parsed);
      res.status(201).json(budget);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

  app.put("/api/budgets/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const parsed = insertBudgetSchema.partial().parse(req.body);
      const budget = await storage.updateBudget(id, parsed);
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      res.json(budget);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

  app.delete("/api/budgets/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBudget(id);
      if (!deleted) {
        return res.status(404).json({ message: "Budget not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Loan routes
  app.get("/api/loans", requireAuth, async (req, res) => {
    try {
      const loans = await storage.getLoans(req.session.userId!);
      res.json(loans);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/loans", requireAuth, async (req, res) => {
    try {
      const parsed = insertLoanSchema.parse({ ...req.body, userId: req.session.userId! });
      const loan = await storage.createLoan(parsed);
      res.status(201).json(loan);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

  app.put("/api/loans/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const parsed = insertLoanSchema.partial().parse(req.body);
      const loan = await storage.updateLoan(id, parsed);
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      res.json(loan);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

  app.delete("/api/loans/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteLoan(id);
      if (!deleted) {
        return res.status(404).json({ message: "Loan not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Loan Payment routes
  app.get("/api/loans/:loanId/payments", requireAuth, async (req, res) => {
    try {
      const { loanId } = req.params;
      const payments = await storage.getLoanPayments(loanId);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/loans/:loanId/payments", requireAuth, async (req, res) => {
    try {
      const { loanId } = req.params;
      const parsed = insertLoanPaymentSchema.parse({ ...req.body, loanId });
      const payment = await storage.createLoanPayment(parsed);
      
      // Update loan paidAmount
      const loan = await storage.getLoan(loanId);
      if (loan) {
        const newPaidAmount = Number(loan.paidAmount) + Number(parsed.amount);
        await storage.updateLoan(loanId, { paidAmount: newPaidAmount.toString() as any });
      }
      
      res.status(201).json(payment);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

  app.put("/api/payments/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get existing payment to calculate difference
      const existingPayment = await storage.getLoanPayment(id);
      if (!existingPayment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      // Don't allow loanId changes
      const updateData = { ...req.body };
      delete updateData.loanId;
      
      const parsed = insertLoanPaymentSchema.partial().parse(updateData);
      const payment = await storage.updateLoanPayment(id, parsed);
      
      // Update loan paidAmount if amount changed
      if (parsed.amount) {
        const loan = await storage.getLoan(existingPayment.loanId);
        if (loan) {
          const oldAmount = Number(existingPayment.amount);
          const newAmount = Number(parsed.amount);
          const difference = newAmount - oldAmount;
          const newPaidAmount = Number(loan.paidAmount) + difference;
          await storage.updateLoan(existingPayment.loanId, { paidAmount: newPaidAmount.toString() as any });
        }
      }
      
      res.json(payment);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

  app.delete("/api/payments/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get payment to subtract from loan
      const payment = await storage.getLoanPayment(id);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      // Delete payment
      const deleted = await storage.deleteLoanPayment(id);
      if (!deleted) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      // Update loan paidAmount
      const loan = await storage.getLoan(payment.loanId);
      if (loan) {
        const newPaidAmount = Number(loan.paidAmount) - Number(payment.amount);
        await storage.updateLoan(payment.loanId, { paidAmount: Math.max(0, newPaidAmount).toString() as any });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Business Transaction routes
  app.get("/api/business-transactions", requireAuth, async (req, res) => {
    try {
      const transactions = await storage.getBusinessTransactions(req.session.userId!);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/business-transactions", requireAuth, async (req, res) => {
    try {
      const parsed = insertBusinessTransactionSchema.parse({ ...req.body, userId: req.session.userId! });
      const transaction = await storage.createBusinessTransaction(parsed);
      res.status(201).json(transaction);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

  app.put("/api/business-transactions/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const parsed = insertBusinessTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateBusinessTransaction(id, parsed);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

  app.delete("/api/business-transactions/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBusinessTransaction(id);
      if (!deleted) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Custom Field routes
  app.get("/api/custom-fields", requireAuth, async (req, res) => {
    try {
      const fields = await storage.getCustomFields(req.session.userId!);
      res.json(fields);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/custom-fields", requireAuth, async (req, res) => {
    try {
      const parsed = insertCustomFieldSchema.parse({ ...req.body, userId: req.session.userId! });
      const field = await storage.createCustomField(parsed);
      res.status(201).json(field);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

  app.put("/api/custom-fields/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const parsed = insertCustomFieldSchema.partial().parse(req.body);
      const field = await storage.updateCustomField(id, parsed);
      if (!field) {
        return res.status(404).json({ message: "Custom field not found" });
      }
      res.json(field);
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

  app.delete("/api/custom-fields/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCustomField(id);
      if (!deleted) {
        return res.status(404).json({ message: "Custom field not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Dashboard analytics routes
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const expenses = await storage.getExpenses(req.session.userId!);
      const businessTransactions = await storage.getBusinessTransactions(req.session.userId!);
      
      const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      
      // Calculate income from business transactions
      const totalIncome = businessTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const businessExpenses = businessTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const totalBalance = totalIncome - (totalExpenses + businessExpenses);
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
      
      res.json({
        totalBalance,
        totalIncome,
        totalExpenses,
        savingsRate: savingsRate.toFixed(1)
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/dashboard/category-breakdown", requireAuth, async (req, res) => {
    try {
      const expenses = await storage.getExpenses(req.session.userId!);
      const categoryMap = new Map<string, number>();
      
      expenses.forEach(exp => {
        const current = categoryMap.get(exp.category) || 0;
        categoryMap.set(exp.category, current + Number(exp.amount));
      });
      
      const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value
      }));
      
      res.json(categoryData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/dashboard/monthly-trend", requireAuth, async (req, res) => {
    try {
      const expenses = await storage.getExpenses(req.session.userId!);
      
      // Group expenses by month
      const monthlyMap = new Map<string, number>();
      expenses.forEach(exp => {
        const date = new Date(exp.date);
        const monthKey = date.toLocaleString('en-US', { month: 'short' });
        const current = monthlyMap.get(monthKey) || 0;
        monthlyMap.set(monthKey, current + Number(exp.amount));
      });
      
      const monthlyData = Array.from(monthlyMap.entries()).map(([month, expenses]) => ({
        month,
        expenses
      }));
      
      res.json(monthlyData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
