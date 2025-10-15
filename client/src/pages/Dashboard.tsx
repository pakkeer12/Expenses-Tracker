import { useState } from "react";
import { StatCard } from "@/components/StatCard";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseDialog } from "@/components/ExpenseDialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

//todo: remove mock functionality
const categoryData = [
  { name: "Food", value: 450, color: "hsl(var(--chart-4))" },
  { name: "Transport", value: 180, color: "hsl(var(--chart-1))" },
  { name: "Entertainment", value: 320, color: "hsl(var(--chart-5))" },
  { name: "Shopping", value: 280, color: "hsl(var(--chart-3))" },
  { name: "Bills", value: 150, color: "hsl(var(--chart-2))" },
];

const monthlyData = [
  { month: "Jan", expenses: 2100 },
  { month: "Feb", expenses: 2400 },
  { month: "Mar", expenses: 2200 },
  { month: "Apr", expenses: 2800 },
  { month: "May", expenses: 2600 },
  { month: "Jun", expenses: 3260 },
];

export default function Dashboard() {
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

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
        <StatCard
          title="Total Balance"
          value="$5,240.50"
          icon={Wallet}
          trend="+12.5% from last month"
          trendUp={true}
        />
        <StatCard
          title="Total Income"
          value="$8,500.00"
          icon={DollarSign}
          trend="+5.2% from last month"
          trendUp={true}
        />
        <StatCard
          title="Total Expenses"
          value="$3,259.50"
          icon={TrendingDown}
        />
        <StatCard
          title="Savings Rate"
          value="61.7%"
          icon={TrendingUp}
          trend="+2.3% from last month"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      <ExpenseDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        onSave={(expense) => console.log("Save expense:", expense)}
      />
    </div>
  );
}
