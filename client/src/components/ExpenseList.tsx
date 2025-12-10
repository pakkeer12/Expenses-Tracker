import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrency } from "@/hooks/use-currency";

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  Food: "bg-chart-4 text-white",
  Transport: "bg-chart-1 text-white",
  Entertainment: "bg-chart-5 text-white",
  Shopping: "bg-chart-3 text-white",
  Bills: "bg-chart-2 text-white",
  Other: "bg-muted text-muted-foreground",
};

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  const { symbol } = useCurrency();
  
  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <Card key={expense.id} className="hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate" data-testid={`text-expense-title-${expense.id}`}>
                    {expense.title}
                  </h3>
                  <Badge
                    className={categoryColors[expense.category] || categoryColors.Other}
                    data-testid={`badge-category-${expense.id}`}
                  >
                    {expense.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                  <span data-testid={`text-expense-date-${expense.id}`}>{expense.date}</span>
                  {expense.notes && (
                    <span className="truncate">{expense.notes}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold whitespace-nowrap" data-testid={`text-expense-amount-${expense.id}`}>
                  {symbol}{expense.amount.toFixed(2)}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit?.(expense)}
                    data-testid={`button-edit-expense-${expense.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete?.(expense.id)}
                    data-testid={`button-delete-expense-${expense.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
