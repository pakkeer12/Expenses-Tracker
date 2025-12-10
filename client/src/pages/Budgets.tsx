import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { BudgetCard } from "@/components/BudgetCard";
import { BudgetDialog } from "@/components/BudgetDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { Budget, Expense } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useBudgets, useCreateBudget, useDeleteBudget, useUpdateBudget } from "@/hooks/use-budgets";
import { useExpenses } from "@/hooks/use-expenses";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/use-currency";

export default function Budgets() {
  const {symbol} = useCurrency();
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets();
  const { data: expenses = [] } = useExpenses();
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const deleteMutation = useDeleteBudget();

  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const { toast } = useToast();

  const calculateSpent = (category: string): number => {
    return expenses
      .filter((exp) => exp.category === category)
      .reduce((sum, exp) => sum + Number(exp.amount), 0);
  };

  const budgetsWithSpent = budgets.map((budget) => ({
    ...budget,
    spent: calculateSpent(budget.category),
    limit: Number(budget.limit),
  }));

  const totalSpent = budgetsWithSpent.reduce((sum, budget) => sum + budget.spent, 0);
  const totalLimit = budgetsWithSpent.reduce((sum, budget) => sum + budget.limit, 0);
  const totalPercentage = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  const handleSave = async (budget: any) => {
    try {
    // Convert limit to number
    const budgetData = {
      ...budget,
      limit: parseFloat(budget.limit),
    };

    if (editingBudget) {
      await updateMutation.mutateAsync({ id: editingBudget.id, data: budgetData });
      setEditingBudget(null);
      toast({
        title: "Budget updated",
        description: "Your budget has been updated successfully.",
      });
    } else {
      await createMutation.mutateAsync(budgetData);
      setBudgetDialogOpen(false);
      toast({
        title: "Budget created",
        description: "Your budget has been created successfully.",
      });
    }  
    } catch (error: any) {
       toast({
        title: "Error",
        description: error.message || "Failed to save budget",
        variant: "destructive",
      });
    }
    
  };

  const handleEdit = (id: string) => {
    const budget = budgets.find((b) => b.id === id);
    if (budget) {
      setEditingBudget(budget);
      setBudgetDialogOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this budget?")) {
    try {
      await deleteMutation.mutateAsync(id);
       toast({
        title: "Budget deleted",
        description: "Your budget has been deleted successfully.",
      });
    } catch (error: any) {
       toast({
        title: "Error",
        description: error.message || "Failed to delete budget",
        variant: "destructive",
      });
    }
    }
  };

  const handleDialogClose = (open: boolean) => {
    setBudgetDialogOpen(open);
    if (!open) {
      setEditingBudget(null);
    }
  };

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
          {budgetsLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Overall Budget</h3>
                  <p className="text-sm text-muted-foreground">Total spending across all categories</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" data-testid="text-total-spent">
                    {symbol} {totalSpent.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    of {symbol} {totalLimit.toFixed(2)}
                  </p>
                </div>
              </div>
              <Progress value={Math.min(totalPercentage, 100)} />
              <p className="text-sm text-muted-foreground text-center">
                {totalPercentage.toFixed(1)}% of total budget used
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {budgetsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : budgetsWithSpent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetsWithSpent.map((budget) => (
            <BudgetCard
              key={budget.id}
              id={budget.id}
              category={budget.category}
              spent={budget.spent}
              limit={budget.limit}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
            No budgets set yet. Click "Set Budget" to create one.
          </CardContent>
        </Card>
      )}

      <BudgetDialog
        open={budgetDialogOpen}
        onOpenChange={handleDialogClose}
        budget={editingBudget}
        onSave={handleSave}
      />
    </div>
  );
}
