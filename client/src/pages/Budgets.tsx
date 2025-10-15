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

export default function Budgets() {
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const { toast } = useToast();

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const createMutation = useMutation({
    mutationFn: (budget: any) => apiRequest("/api/budgets", "POST", budget),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      setBudgetDialogOpen(false);
      toast({
        title: "Budget created",
        description: "Your budget has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create budget",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/budgets/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      setEditingBudget(null);
      toast({
        title: "Budget updated",
        description: "Your budget has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update budget",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/budgets/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      toast({
        title: "Budget deleted",
        description: "Your budget has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete budget",
        variant: "destructive",
      });
    },
  });

  const calculateSpent = (category: string): number => {
    return expenses
      .filter((exp) => exp.category === category)
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  };

  const budgetsWithSpent = budgets.map((budget) => ({
    ...budget,
    spent: calculateSpent(budget.category),
    limit: parseFloat(budget.limit),
  }));

  const totalSpent = budgetsWithSpent.reduce((sum, budget) => sum + budget.spent, 0);
  const totalLimit = budgetsWithSpent.reduce((sum, budget) => sum + budget.limit, 0);
  const totalPercentage = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  const handleSave = (budget: any) => {
    if (editingBudget) {
      updateMutation.mutate({ id: editingBudget.id, data: budget });
    } else {
      createMutation.mutate(budget);
    }
  };

  const handleEdit = (id: string) => {
    const budget = budgets.find((b) => b.id === id);
    if (budget) {
      setEditingBudget(budget);
      setBudgetDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this budget?")) {
      deleteMutation.mutate(id);
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
