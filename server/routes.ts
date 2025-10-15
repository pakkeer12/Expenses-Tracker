import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExpenseSchema, insertBudgetSchema, insertLoanSchema, insertLoanPaymentSchema, insertBusinessTransactionSchema, insertCustomFieldSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

// Temporary hardcoded user ID until authentication is implemented
const TEMP_USER_ID = "temp-user-001";

export async function registerRoutes(app: Express): Promise<Server> {
  // Expense routes
  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getExpenses(TEMP_USER_ID);
      res.json(expenses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const parsed = insertExpenseSchema.parse({ ...req.body, userId: TEMP_USER_ID });
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

  app.put("/api/expenses/:id", async (req, res) => {
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

  app.delete("/api/expenses/:id", async (req, res) => {
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
  app.get("/api/budgets", async (req, res) => {
    try {
      const budgets = await storage.getBudgets(TEMP_USER_ID);
      res.json(budgets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const parsed = insertBudgetSchema.parse({ ...req.body, userId: TEMP_USER_ID });
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

  app.put("/api/budgets/:id", async (req, res) => {
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

  app.delete("/api/budgets/:id", async (req, res) => {
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
  app.get("/api/loans", async (req, res) => {
    try {
      const loans = await storage.getLoans(TEMP_USER_ID);
      res.json(loans);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/loans", async (req, res) => {
    try {
      const parsed = insertLoanSchema.parse({ ...req.body, userId: TEMP_USER_ID });
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

  app.put("/api/loans/:id", async (req, res) => {
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

  app.delete("/api/loans/:id", async (req, res) => {
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
  app.get("/api/loans/:loanId/payments", async (req, res) => {
    try {
      const { loanId } = req.params;
      const payments = await storage.getLoanPayments(loanId);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/loans/:loanId/payments", async (req, res) => {
    try {
      const { loanId } = req.params;
      const parsed = insertLoanPaymentSchema.parse({ ...req.body, loanId });
      const payment = await storage.createLoanPayment(parsed);
      
      // Update loan paidAmount
      const loan = await storage.getLoan(loanId);
      if (loan) {
        const newPaidAmount = parseFloat(loan.paidAmount) + parseFloat(parsed.amount as any);
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

  app.put("/api/payments/:id", async (req, res) => {
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
          const oldAmount = parseFloat(existingPayment.amount);
          const newAmount = parseFloat(parsed.amount as any);
          const difference = newAmount - oldAmount;
          const newPaidAmount = parseFloat(loan.paidAmount) + difference;
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

  app.delete("/api/payments/:id", async (req, res) => {
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
        const newPaidAmount = parseFloat(loan.paidAmount) - parseFloat(payment.amount);
        await storage.updateLoan(payment.loanId, { paidAmount: Math.max(0, newPaidAmount).toString() as any });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Business Transaction routes
  app.get("/api/business-transactions", async (req, res) => {
    try {
      const transactions = await storage.getBusinessTransactions(TEMP_USER_ID);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/business-transactions", async (req, res) => {
    try {
      const parsed = insertBusinessTransactionSchema.parse({ ...req.body, userId: TEMP_USER_ID });
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

  app.put("/api/business-transactions/:id", async (req, res) => {
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

  app.delete("/api/business-transactions/:id", async (req, res) => {
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
  app.get("/api/custom-fields", async (req, res) => {
    try {
      const fields = await storage.getCustomFields(TEMP_USER_ID);
      res.json(fields);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/custom-fields", async (req, res) => {
    try {
      const parsed = insertCustomFieldSchema.parse({ ...req.body, userId: TEMP_USER_ID });
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

  app.put("/api/custom-fields/:id", async (req, res) => {
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

  app.delete("/api/custom-fields/:id", async (req, res) => {
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
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const expenses = await storage.getExpenses(TEMP_USER_ID);
      const businessTransactions = await storage.getBusinessTransactions(TEMP_USER_ID);
      
      const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      
      // Calculate income from business transactions
      const totalIncome = businessTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const businessExpenses = businessTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
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

  app.get("/api/dashboard/category-breakdown", async (req, res) => {
    try {
      const expenses = await storage.getExpenses(TEMP_USER_ID);
      const categoryMap = new Map<string, number>();
      
      expenses.forEach(exp => {
        const current = categoryMap.get(exp.category) || 0;
        categoryMap.set(exp.category, current + parseFloat(exp.amount));
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

  app.get("/api/dashboard/monthly-trend", async (req, res) => {
    try {
      const expenses = await storage.getExpenses(TEMP_USER_ID);
      
      // Group expenses by month
      const monthlyMap = new Map<string, number>();
      expenses.forEach(exp => {
        const date = new Date(exp.date);
        const monthKey = date.toLocaleString('en-US', { month: 'short' });
        const current = monthlyMap.get(monthKey) || 0;
        monthlyMap.set(monthKey, current + parseFloat(exp.amount));
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
