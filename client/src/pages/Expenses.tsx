import { useState } from "react";
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

//todo: remove mock functionality
const mockExpenses = [
  {
    id: "1",
    title: "Grocery Shopping",
    amount: 125.50,
    category: "Food",
    date: "2025-10-04",
    notes: "Weekly groceries",
  },
  {
    id: "2",
    title: "Uber to Work",
    amount: 15.00,
    category: "Transport",
    date: "2025-10-03",
  },
  {
    id: "3",
    title: "Netflix Subscription",
    amount: 15.99,
    category: "Entertainment",
    date: "2025-10-01",
  },
  {
    id: "4",
    title: "New Shoes",
    amount: 89.99,
    category: "Shopping",
    date: "2025-09-30",
  },
  {
    id: "5",
    title: "Electricity Bill",
    amount: 120.00,
    category: "Bills",
    date: "2025-09-28",
  },
];

export default function Expenses() {
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [importedTransactions, setImportedTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const handleExportCSV = () => {
    console.log("Exporting expenses to CSV");
  };

  const handleUploadComplete = (transactions: any[]) => {
    setImportedTransactions(transactions);
    setUploadDialogOpen(false);
    setReviewDialogOpen(true);
  };

  const handleSaveImportedTransactions = (transactions: any[]) => {
    console.log("Saving imported transactions:", transactions);
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
            <SelectItem value="Food">Food</SelectItem>
            <SelectItem value="Transport">Transport</SelectItem>
            <SelectItem value="Entertainment">Entertainment</SelectItem>
            <SelectItem value="Shopping">Shopping</SelectItem>
            <SelectItem value="Bills">Bills</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ExpenseList
        expenses={mockExpenses}
        onEdit={(expense) => console.log("Edit expense:", expense)}
        onDelete={(id) => console.log("Delete expense:", id)}
      />

      <ExpenseDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        onSave={(expense) => console.log("Save expense:", expense)}
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
