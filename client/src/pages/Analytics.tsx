import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, TrendingUp } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

//todo: remove mock functionality
const categoryData = [
  { name: "Food", value: 450, color: "hsl(var(--chart-4))" },
  { name: "Transport", value: 180, color: "hsl(var(--chart-1))" },
  { name: "Entertainment", value: 320, color: "hsl(var(--chart-5))" },
  { name: "Shopping", value: 280, color: "hsl(var(--chart-3))" },
  { name: "Bills", value: 150, color: "hsl(var(--chart-2))" },
];

const monthlyTrend = [
  { month: "Jan", expenses: 2100, budget: 2500 },
  { month: "Feb", expenses: 2400, budget: 2500 },
  { month: "Mar", expenses: 2200, budget: 2500 },
  { month: "Apr", expenses: 2800, budget: 2500 },
  { month: "May", expenses: 2600, budget: 2500 },
  { month: "Jun", expenses: 3260, budget: 2500 },
];

const categoryComparison = [
  { category: "Food", spent: 450, budget: 500 },
  { category: "Transport", spent: 180, budget: 200 },
  { category: "Entertainment", spent: 320, budget: 250 },
  { category: "Shopping", spent: 280, budget: 400 },
  { category: "Bills", spent: 150, budget: 200 },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Detailed insights into your spending patterns</p>
      </div>

      <Alert className="border-chart-3 bg-chart-3/10">
        <AlertCircle className="h-4 w-4 text-chart-3" />
        <AlertTitle className="text-chart-3">Budget Alert</AlertTitle>
        <AlertDescription className="text-chart-3">
          You've exceeded your Entertainment budget by $70.00 this month.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
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
            <CardTitle>Spending vs Budget</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>6-Month Trend</CardTitle>
        </CardHeader>
        <CardContent>
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
              <Legend />
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
            <div className="text-2xl font-bold">$108.65</div>
            <p className="text-xs text-muted-foreground">Based on last 30 days</p>
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
            <div className="text-2xl font-bold">Food</div>
            <p className="text-xs text-muted-foreground">$450.00 this month</p>
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
            <div className="text-2xl font-bold text-chart-3">Critical</div>
            <p className="text-xs text-muted-foreground">1 category over budget</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
