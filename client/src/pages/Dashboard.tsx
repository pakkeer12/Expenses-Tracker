import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { StatCard } from "@/components/StatCard";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/use-currency";
import type { Budget, BusinessTransaction } from "@shared/schema";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function Dashboard() {
  const { symbol } = useCurrency();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalBalance: number;
    totalIncome: number;
    totalExpenses: number;
    savingsRate: string;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: categoryData, isLoading: categoryLoading } = useQuery<
    Array<{ name: string; value: number }>
  >({
    queryKey: ["/api/dashboard/category-breakdown"],
  });

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery<
    Array<{ month: string; expenses: number }>
  >({
    queryKey: ["/api/dashboard/monthly-trend"],
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<BusinessTransaction[]>({
    queryKey: ["/api/business-transactions"],
  });

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  // Filter for expenses only
  const expenses = transactions.filter(t => t.type === 'expense');

  const categoryComparison = useMemo(() => {
    const spentMap = new Map<string, number>();
    expenses.forEach((exp) => {
      const current = spentMap.get(exp.category) || 0;
      spentMap.set(exp.category, current + Number(exp.amount));
    });

    const budgetMap = new Map<string, number>();
    budgets.forEach((budget) => {
      budgetMap.set(budget.category, Number(budget.limit));
    });

    const allCategories = Array.from(new Set([...Array.from(spentMap.keys()), ...Array.from(budgetMap.keys())]));
    return allCategories.map((category) => ({
      category,
      spent: spentMap.get(category) || 0,
      budget: budgetMap.get(category) || 0,
    }));
  }, [expenses, budgets]);

  const monthlyTrend = useMemo(() => {
    const monthlyMap = new Map<string, { expenses: number; budget: number }>();
    
    expenses.forEach((exp) => {
      const date = new Date(exp.date);
      const monthKey = date.toLocaleString('en-US', { month: 'short' });
      const current = monthlyMap.get(monthKey) || { expenses: 0, budget: 0 };
      monthlyMap.set(monthKey, {
        ...current,
        expenses: current.expenses + Number(exp.amount),
      });
    });

    const totalBudget = budgets.reduce((sum, b) => sum + Number(b.limit), 0);
    monthlyMap.forEach((value, key) => {
      monthlyMap.set(key, { ...value, budget: totalBudget });
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months
      .map(month => ({
        month,
        expenses: monthlyMap.get(month)?.expenses || 0,
        budget: monthlyMap.get(month)?.budget || totalBudget,
      }))
      .filter(item => item.expenses > 0 || item.budget > 0);
  }, [expenses, budgets]);

  const overBudgetCategories = useMemo(() => {
    return categoryComparison.filter(
      (item) => item.budget > 0 && item.spent > item.budget
    );
  }, [categoryComparison]);

  const avgDailySpending = useMemo(() => {
    if (expenses.length === 0) return 0;
    const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const dates = expenses.map((exp) => new Date(exp.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const days = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) || 1;
    return total / days;
  }, [expenses]);

  const mostSpentCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();
    expenses.forEach((exp) => {
      const current = categoryMap.get(exp.category) || 0;
      categoryMap.set(exp.category, current + Number(exp.amount));
    });
    const entries = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
    if (entries.length === 0) return { name: "N/A", value: 0 };
    return entries.reduce((max, curr) => (curr.value > max.value ? curr : max));
  }, [expenses]);

  const budgetHealth = useMemo(() => {
    if (overBudgetCategories.length === 0) return "Healthy";
    if (overBudgetCategories.length === 1) return "Warning";
    return "Critical";
  }, [overBudgetCategories]);

  const categoryDataWithColors = categoryData?.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
  })) || [];

  const isLoading = statsLoading || categoryLoading || monthlyLoading || transactionsLoading || budgetsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your financial activity</p>
        </div>
        <Button onClick={() => setLocation("/business")} data-testid="button-add-transaction">
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Budget Alert */}
      {!isLoading && overBudgetCategories.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {overBudgetCategories.length} {overBudgetCategories.length === 1 ? 'category is' : 'categories are'} over budget. {overBudgetCategories.map(c => c.name).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Total Balance"
              value={`${symbol}${(stats?.totalBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={Wallet}
              valueColor={stats?.totalBalance ?? 0 >= 0 ? "text-green-600" : "text-red-600"}
            />
            <StatCard
              title="Total Income"
              value={`${symbol}${(stats?.totalIncome ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={DollarSign}
              valueColor="text-green-600"
            />
            <StatCard
              title="Total Expenses"
              value={`${symbol}${(stats?.totalExpenses ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={TrendingDown}
              valueColor="text-red-600"
            />
            <StatCard
              title="Savings Rate"
              value={`${stats?.savingsRate ?? '0.0'}%`}
              icon={TrendingUp}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : categoryDataWithColors.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryDataWithColors}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryDataWithColors.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No expense data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend (Expenses vs Budget)</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : monthlyTrend && monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                    name="Expenses"
                  />
                  <Line
                    type="monotone"
                    dataKey="budget"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--secondary))" }}
                    name="Budget"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No monthly trend data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Spending vs Budget Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Spending vs Budget by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : categoryComparison && categoryComparison.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="spent" fill="hsl(var(--primary))" name="Spent" />
                <Bar dataKey="budgeted" fill="hsl(var(--muted))" name="Budgeted" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No category data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Average Daily Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {`${symbol}${(avgDailySpending ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Based on current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Most Spent Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mostSpentCategory?.name || 'N/A'}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {mostSpentCategory && mostSpentCategory.value > 0 ? `${symbol}${mostSpentCategory.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              budgetHealth === 'Healthy' ? 'text-green-600' :
              budgetHealth === 'Warning' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {budgetHealth || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Overall budget status</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
