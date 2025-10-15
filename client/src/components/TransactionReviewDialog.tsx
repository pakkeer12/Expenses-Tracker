import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "debit" | "credit";
  category: string;
  business: boolean;
}

interface TransactionReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: Transaction[];
  onSave?: (transactions: Transaction[]) => void;
}

const categories = ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Healthcare", "Salary", "Other"];

export function TransactionReviewDialog({
  open,
  onOpenChange,
  transactions: initialTransactions,
  onSave,
}: TransactionReviewDialogProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const handleCategoryChange = (id: string, category: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, category } : t))
    );
  };

  const handleBusinessToggle = (id: string, checked: boolean) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, business: checked } : t))
    );
  };

  const handleSaveAll = () => {
    onSave?.(transactions);
    onOpenChange(false);
  };

  const totalTransactions = transactions.length;
  const categorizedCount = transactions.filter((t) => t.category).length;
  const businessCount = transactions.filter((t) => t.business).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Review & Categorize Transactions</DialogTitle>
          <DialogDescription>
            Assign categories and mark business transactions from your bank statement
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Imported</p>
              <p className="text-2xl font-bold">{totalTransactions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Categorized</p>
              <p className="text-2xl font-bold text-chart-2">
                {categorizedCount}/{totalTransactions}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Business</p>
              <p className="text-2xl font-bold text-chart-1">{businessCount}</p>
            </CardContent>
          </Card>
        </div>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {transaction.type === "credit" ? (
                              <ArrowUpCircle className="h-4 w-4 text-chart-2" />
                            ) : (
                              <ArrowDownCircle className="h-4 w-4 text-chart-3" />
                            )}
                            <span className="font-semibold" data-testid={`text-description-${transaction.id}`}>
                              {transaction.description}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                        <span
                          className={`text-lg font-bold whitespace-nowrap ${
                            transaction.type === "credit" ? "text-chart-2" : "text-chart-3"
                          }`}
                          data-testid={`text-amount-${transaction.id}`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}$
                          {transaction.amount.toFixed(2)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Category</label>
                          <Select
                            value={transaction.category}
                            onValueChange={(value) =>
                              handleCategoryChange(transaction.id, value)
                            }
                          >
                            <SelectTrigger data-testid={`select-category-${transaction.id}`}>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-end">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`business-${transaction.id}`}
                              checked={transaction.business}
                              onCheckedChange={(checked) =>
                                handleBusinessToggle(transaction.id, checked as boolean)
                              }
                              data-testid={`checkbox-business-${transaction.id}`}
                            />
                            <label
                              htmlFor={`business-${transaction.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              Business Transaction
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              {categorizedCount} of {totalTransactions} transactions categorized
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-review"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveAll} data-testid="button-save-transactions">
                Save All Transactions
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
