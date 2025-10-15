import { db } from "./db";
import { 
  users, expenses, budgets, loans, loanPayments, businessTransactions, customFields,
  type User, type InsertUser,
  type Expense, type InsertExpense,
  type Budget, type InsertBudget,
  type Loan, type InsertLoan,
  type LoanPayment, type InsertLoanPayment,
  type BusinessTransaction, type InsertBusinessTransaction,
  type CustomField, type InsertCustomField
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Expense methods
  getExpenses(userId: string): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<boolean>;

  // Budget methods
  getBudgets(userId: string): Promise<Budget[]>;
  getBudget(id: string): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: string, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: string): Promise<boolean>;

  // Loan methods
  getLoans(userId: string): Promise<Loan[]>;
  getLoan(id: string): Promise<Loan | undefined>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoan(id: string, loan: Partial<InsertLoan>): Promise<Loan | undefined>;
  deleteLoan(id: string): Promise<boolean>;

  // Loan Payment methods
  getLoanPayments(loanId: string): Promise<LoanPayment[]>;
  getLoanPayment(id: string): Promise<LoanPayment | undefined>;
  createLoanPayment(payment: InsertLoanPayment): Promise<LoanPayment>;
  updateLoanPayment(id: string, payment: Partial<InsertLoanPayment>): Promise<LoanPayment | undefined>;
  deleteLoanPayment(id: string): Promise<boolean>;

  // Business Transaction methods
  getBusinessTransactions(userId: string): Promise<BusinessTransaction[]>;
  getBusinessTransaction(id: string): Promise<BusinessTransaction | undefined>;
  createBusinessTransaction(transaction: InsertBusinessTransaction): Promise<BusinessTransaction>;
  updateBusinessTransaction(id: string, transaction: Partial<InsertBusinessTransaction>): Promise<BusinessTransaction | undefined>;
  deleteBusinessTransaction(id: string): Promise<boolean>;

  // Custom Field methods
  getCustomFields(userId: string): Promise<CustomField[]>;
  createCustomField(field: InsertCustomField): Promise<CustomField>;
  updateCustomField(id: string, field: Partial<InsertCustomField>): Promise<CustomField | undefined>;
  deleteCustomField(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Expense methods
  async getExpenses(userId: string): Promise<Expense[]> {
    return await db.select().from(expenses).where(eq(expenses.userId, userId)).orderBy(desc(expenses.date));
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    const result = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
    return result[0];
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const result = await db.insert(expenses).values(expense).returning();
    return result[0];
  }

  async updateExpense(id: string, expense: Partial<InsertExpense>): Promise<Expense | undefined> {
    const result = await db.update(expenses).set(expense).where(eq(expenses.id, id)).returning();
    return result[0];
  }

  async deleteExpense(id: string): Promise<boolean> {
    const result = await db.delete(expenses).where(eq(expenses.id, id)).returning();
    return result.length > 0;
  }

  // Budget methods
  async getBudgets(userId: string): Promise<Budget[]> {
    return await db.select().from(budgets).where(eq(budgets.userId, userId));
  }

  async getBudget(id: string): Promise<Budget | undefined> {
    const result = await db.select().from(budgets).where(eq(budgets.id, id)).limit(1);
    return result[0];
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const result = await db.insert(budgets).values(budget).returning();
    return result[0];
  }

  async updateBudget(id: string, budget: Partial<InsertBudget>): Promise<Budget | undefined> {
    const result = await db.update(budgets).set(budget).where(eq(budgets.id, id)).returning();
    return result[0];
  }

  async deleteBudget(id: string): Promise<boolean> {
    const result = await db.delete(budgets).where(eq(budgets.id, id)).returning();
    return result.length > 0;
  }

  // Loan methods
  async getLoans(userId: string): Promise<Loan[]> {
    return await db.select().from(loans).where(eq(loans.userId, userId)).orderBy(desc(loans.createdAt));
  }

  async getLoan(id: string): Promise<Loan | undefined> {
    const result = await db.select().from(loans).where(eq(loans.id, id)).limit(1);
    return result[0];
  }

  async createLoan(loan: InsertLoan): Promise<Loan> {
    const result = await db.insert(loans).values(loan).returning();
    return result[0];
  }

  async updateLoan(id: string, loan: Partial<InsertLoan>): Promise<Loan | undefined> {
    const result = await db.update(loans).set(loan).where(eq(loans.id, id)).returning();
    return result[0];
  }

  async deleteLoan(id: string): Promise<boolean> {
    const result = await db.delete(loans).where(eq(loans.id, id)).returning();
    return result.length > 0;
  }

  // Loan Payment methods
  async getLoanPayments(loanId: string): Promise<LoanPayment[]> {
    return await db.select().from(loanPayments).where(eq(loanPayments.loanId, loanId)).orderBy(desc(loanPayments.date));
  }

  async getLoanPayment(id: string): Promise<LoanPayment | undefined> {
    const result = await db.select().from(loanPayments).where(eq(loanPayments.id, id)).limit(1);
    return result[0];
  }

  async createLoanPayment(payment: InsertLoanPayment): Promise<LoanPayment> {
    const result = await db.insert(loanPayments).values(payment).returning();
    return result[0];
  }

  async updateLoanPayment(id: string, payment: Partial<InsertLoanPayment>): Promise<LoanPayment | undefined> {
    const result = await db.update(loanPayments).set(payment).where(eq(loanPayments.id, id)).returning();
    return result[0];
  }

  async deleteLoanPayment(id: string): Promise<boolean> {
    const result = await db.delete(loanPayments).where(eq(loanPayments.id, id)).returning();
    return result.length > 0;
  }

  // Business Transaction methods
  async getBusinessTransactions(userId: string): Promise<BusinessTransaction[]> {
    return await db.select().from(businessTransactions).where(eq(businessTransactions.userId, userId)).orderBy(desc(businessTransactions.date));
  }

  async getBusinessTransaction(id: string): Promise<BusinessTransaction | undefined> {
    const result = await db.select().from(businessTransactions).where(eq(businessTransactions.id, id)).limit(1);
    return result[0];
  }

  async createBusinessTransaction(transaction: InsertBusinessTransaction): Promise<BusinessTransaction> {
    const result = await db.insert(businessTransactions).values(transaction).returning();
    return result[0];
  }

  async updateBusinessTransaction(id: string, transaction: Partial<InsertBusinessTransaction>): Promise<BusinessTransaction | undefined> {
    const result = await db.update(businessTransactions).set(transaction).where(eq(businessTransactions.id, id)).returning();
    return result[0];
  }

  async deleteBusinessTransaction(id: string): Promise<boolean> {
    const result = await db.delete(businessTransactions).where(eq(businessTransactions.id, id)).returning();
    return result.length > 0;
  }

  // Custom Field methods
  async getCustomFields(userId: string): Promise<CustomField[]> {
    return await db.select().from(customFields).where(eq(customFields.userId, userId));
  }

  async createCustomField(field: InsertCustomField): Promise<CustomField> {
    const result = await db.insert(customFields).values(field).returning();
    return result[0];
  }

  async updateCustomField(id: string, field: Partial<InsertCustomField>): Promise<CustomField | undefined> {
    const result = await db.update(customFields).set(field).where(eq(customFields.id, id)).returning();
    return result[0];
  }

  async deleteCustomField(id: string): Promise<boolean> {
    const result = await db.delete(customFields).where(eq(customFields.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
