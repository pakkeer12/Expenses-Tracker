import { useState, useMemo } from "react";
import { ExpenseList } from "@/components/ExpenseList";
import { ExpenseDialog } from "@/components/ExpenseDialog";
import { BankStatementUpload } from "@/components/BankStatementUpload";
import { TransactionReviewDialog } from "@/components/TransactionReviewDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Download, Upload } from "lucide-react";
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from "@/hooks/use-expenses";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function Expenses() {
  const { user } = useAuth();
  const categories = Array.isArray(user?.categories) 
    ? user.categories 
    : ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Other"];
    
  const { data: expenses = [], isLoading } = useExpenses();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();
  const { toast } = useToast();
  
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [importedTransactions, setImportedTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingExpense, setEditingExpense] = useState<any>(null);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch = searchQuery === "" || 
        expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (expense.notes && expense.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchQuery, categoryFilter]);

  const handleExportCSV = () => {
    const csvContent = [
      ["Title", "Amount", "Category", "Date", "Notes"].join(","),
      ...expenses.map(exp => [
        exp.title,
        exp.amount,
        exp.category,
        exp.date,
        exp.notes || ""
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadComplete = (transactions: any[]) => {
    setImportedTransactions(transactions);
    setUploadDialogOpen(false);
    setReviewDialogOpen(true);
  };

  const handleSaveImportedTransactions = async (transactions: any[]) => {
    for (const transaction of transactions) {
      await createExpense.mutateAsync({
        title: transaction.description || "Imported expense",
        amount: typeof transaction.amount === 'string' 
          ? parseFloat(transaction.amount) 
          : Number(transaction.amount),
        category: transaction.category || "Other",
        date: transaction.date,
        notes: transaction.notes,
      });
    }
    setReviewDialogOpen(false);
    toast({
      title: "Success",
      description: `Imported ${transactions.length} expenses`,
    });
  };

  const handleSaveExpense = async (data: any) => {
    try {
      // Convert amount to number
      const expenseData = {
        title: data.title,
        amount: parseFloat(data.amount),
        category: data.category,
        date: data.date,
        notes: data.notes || null,
      };

      if (editingExpense) {
        await updateExpense.mutateAsync({
          id: editingExpense.id,
          data: expenseData,
        });
        toast({
          title: "Success",
          description: "Expense updated successfully",
        });
      } else {
        await createExpense.mutateAsync(expenseData);
        toast({
          title: "Success",
          description: "Expense created successfully",
        });
      }
      setExpenseDialogOpen(false);
      setEditingExpense(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setExpenseDialogOpen(true);
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense.mutateAsync(id);
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">Track and manage your expenses</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setUploadDialogOpen(true)}
            data-testid="button-upload-statement"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Statement
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            data-testid="button-export-csv"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setExpenseDialogOpen(true)} data-testid="button-add-expense">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-expenses"
            />
          </div>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-filter-category">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading expenses...</div>
      ) : filteredExpenses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery || categoryFilter !== "all" ? "No expenses match your filters" : "No expenses yet. Add your first expense!"}
        </div>
      ) : (
        <ExpenseList
          expenses={filteredExpenses.map(exp => ({
            ...exp,
            amount: Number(exp.amount),
            date: exp.date.toString(),
            notes: exp.notes || undefined,
          }))}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
        />
      )}

      <ExpenseDialog
        open={expenseDialogOpen}
        onOpenChange={(open) => {
          setExpenseDialogOpen(open);
          if (!open) setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        expense={editingExpense}
      />

      <BankStatementUpload
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadComplete={handleUploadComplete}
      />

      <TransactionReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        transactions={importedTransactions}
        onSave={handleSaveImportedTransactions}
      />
    </div>
  );
}
