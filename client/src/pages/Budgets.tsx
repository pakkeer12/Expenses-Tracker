import { useState } from "react";
import { BudgetCard } from "@/components/BudgetCard";
import { BudgetDialog } from "@/components/BudgetDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

//todo: remove mock functionality
const mockBudgets = [
  { id: "1", category: "Food", spent: 450.00, limit: 500.00 },
  { id: "2", category: "Transport", spent: 180.00, limit: 200.00 },
  { id: "3", category: "Entertainment", spent: 320.00, limit: 250.00 },
  { id: "4", category: "Shopping", spent: 280.00, limit: 400.00 },
  { id: "5", category: "Bills", spent: 150.00, limit: 200.00 },
];

export default function Budgets() {
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);

  const totalSpent = mockBudgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalLimit = mockBudgets.reduce((sum, budget) => sum + budget.limit, 0);
  const totalPercentage = (totalSpent / totalLimit) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground">Set and track your spending limits</p>
        </div>
        <Button onClick={() => setBudgetDialogOpen(true)} data-testid="button-set-budget">
          <Plus className="h-4 w-4 mr-2" />
          Set Budget
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Overall Budget</h3>
                <p className="text-sm text-muted-foreground">Total spending across all categories</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold" data-testid="text-total-spent">
                  ${totalSpent.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  of ${totalLimit.toFixed(2)}
                </p>
              </div>
            </div>
            <Progress value={Math.min(totalPercentage, 100)} />
            <p className="text-sm text-muted-foreground text-center">
              {totalPercentage.toFixed(1)}% of total budget used
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockBudgets.map((budget) => (
          <BudgetCard
            key={budget.id}
            {...budget}
            onEdit={(id) => console.log("Edit budget:", id)}
            onDelete={(id) => console.log("Delete budget:", id)}
          />
        ))}
      </div>

      <BudgetDialog
        open={budgetDialogOpen}
        onOpenChange={setBudgetDialogOpen}
        onSave={(budget) => console.log("Save budget:", budget)}
      />
    </div>
  );
}
