import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, TrendingUp } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { Expense, Budget } from "@shared/schema";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function Analytics() {
  const { data: expenses = [], isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    expenses.forEach((exp) => {
      const current = categoryMap.get(exp.category) || 0;
      categoryMap.set(exp.category, current + parseFloat(exp.amount));
    });
    return Array.from(categoryMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const categoryComparison = useMemo(() => {
    const spentMap = new Map<string, number>();
    expenses.forEach((exp) => {
      const current = spentMap.get(exp.category) || 0;
      spentMap.set(exp.category, current + parseFloat(exp.amount));
    });

    const budgetMap = new Map<string, number>();
    budgets.forEach((budget) => {
      budgetMap.set(budget.category, parseFloat(budget.limit));
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
        expenses: current.expenses + parseFloat(exp.amount),
      });
    });

    const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.limit), 0);
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
    const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const dates = expenses.map((exp) => new Date(exp.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const days = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) || 1;
    return total / days;
  }, [expenses]);

  const mostSpentCategory = useMemo(() => {
    if (categoryData.length === 0) return { name: "N/A", value: 0 };
    return categoryData.reduce((max, curr) => (curr.value > max.value ? curr : max));
  }, [categoryData]);

  const budgetHealth = useMemo(() => {
    if (overBudgetCategories.length === 0) return "Healthy";
    if (overBudgetCategories.length === 1) return "Warning";
    return "Critical";
  }, [overBudgetCategories]);

  const isLoading = expensesLoading || budgetsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Detailed insights into your spending patterns</p>
      </div>

      {!isLoading && overBudgetCategories.length > 0 && (
        <Alert className="border-chart-3 bg-chart-3/10">
          <AlertCircle className="h-4 w-4 text-chart-3" />
          <AlertTitle className="text-chart-3">Budget Alert</AlertTitle>
          <AlertDescription className="text-chart-3">
            {overBudgetCategories.length === 1
              ? `You've exceeded your ${overBudgetCategories[0].category} budget by $${(
                  overBudgetCategories[0].spent - overBudgetCategories[0].budget
                ).toFixed(2)} this month.`
              : `You've exceeded budgets in ${overBudgetCategories.length} categories.`}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
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
            <CardTitle>Spending vs Budget</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : categoryComparison.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="spent" fill="hsl(var(--primary))" name="Spent" />
                  <Bar dataKey="budget" fill="hsl(var(--muted))" name="Budget" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No budget data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
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
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "hsl(var(--muted-foreground))" }}
                  name="Budget"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              No trend data available
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Daily Spending
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">${avgDailySpending.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Based on expense data</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Spent Category
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{mostSpentCategory.name}</div>
                <p className="text-xs text-muted-foreground">
                  ${mostSpentCategory.value.toFixed(2)} total
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget Health
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div
                  className={`text-2xl font-bold ${
                    budgetHealth === "Healthy"
                      ? "text-chart-2"
                      : budgetHealth === "Warning"
                      ? "text-chart-4"
                      : "text-chart-3"
                  }`}
                >
                  {budgetHealth}
                </div>
                <p className="text-xs text-muted-foreground">
                  {overBudgetCategories.length} {overBudgetCategories.length === 1 ? 'category' : 'categories'} over budget
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
