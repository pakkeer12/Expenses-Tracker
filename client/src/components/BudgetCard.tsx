import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";

interface BudgetCardProps {
  id: string;
  category: string;
  spent: number;
  limit: number;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function BudgetCard({ id, category, spent, limit, onEdit, onDelete }: BudgetCardProps) {
  const percentage = (spent / limit) * 100;
  const isOverBudget = percentage > 100;
  const isWarning = percentage > 70 && percentage <= 100;
  const {symbol} = useCurrency();

  const getProgressColor = () => {
    if (isOverBudget) return "bg-chart-3";
    if (isWarning) return "bg-chart-4";
    return "bg-chart-2";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="text-base font-semibold" data-testid={`text-budget-category-${id}`}>
          {category}
        </CardTitle>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit?.(id)}
            data-testid={`button-edit-budget-${id}`}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete?.(id)}
            data-testid={`button-delete-budget-${id}`}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Spent</span>
          <span className="font-semibold" data-testid={`text-budget-spent-${id}`}>
            {symbol} {spent.toFixed(2)}
          </span>
        </div>
        <Progress value={Math.min(percentage, 100)} className={getProgressColor()} />
        <div className="flex items-center justify-between text-sm">
          <span
            className={`font-medium ${
              isOverBudget ? "text-chart-3" : "text-muted-foreground"
            }`}
            data-testid={`text-budget-percentage-${id}`}
          >
            {percentage.toFixed(0)}% used
          </span>
          <span className="text-muted-foreground" data-testid={`text-budget-limit-${id}`}>
            {symbol} {limit.toFixed(2)} limit
          </span>
        </div>
        {isOverBudget && (
          <div className="text-xs text-chart-3 font-medium">
            Over budget by {symbol} {(spent - limit).toFixed(2)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
