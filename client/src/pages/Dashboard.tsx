import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { StatCard } from "@/components/StatCard";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseDialog } from "@/components/ExpenseDialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/use-currency";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function Dashboard() {
  const { symbol } = useCurrency();
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

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

  const handleExpenseSave = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/dashboard/category-breakdown"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/dashboard/monthly-trend"] });
    setExpenseDialogOpen(false);
  };

  const categoryDataWithColors = categoryData?.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your financial activity</p>
        </div>
        <Button onClick={() => setExpenseDialogOpen(true)} data-testid="button-add-expense">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

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
            />
            <StatCard
              title="Total Income"
              value={`${symbol}${(stats?.totalIncome ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={DollarSign}
            />
            <StatCard
              title="Total Expenses"
              value={`${symbol}${(stats?.totalExpenses ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={TrendingDown}
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
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : monthlyData && monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
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

      <ExpenseDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        onSave={handleExpenseSave}
      />
    </div>
  );
}
