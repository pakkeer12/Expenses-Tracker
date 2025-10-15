import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Download, FileText, Filter, Edit, Trash2, Upload } from "lucide-react";
import { TransactionDialog } from "@/components/TransactionDialog";
import { CustomFieldDialog } from "@/components/CustomFieldDialog";
import { ReportDialog } from "@/components/ReportDialog";
import { BankStatementUpload } from "@/components/BankStatementUpload";
import { TransactionReviewDialog } from "@/components/TransactionReviewDialog";

interface CustomField {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "select";
  options?: string[];
}

interface Transaction {
  id: string;
  date: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  customFields?: Record<string, any>;
}

//todo: remove mock functionality
const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: "2025-10-05",
    type: "income",
    amount: 1500.00,
    category: "Sales",
    description: "Product sale to customer A",
    paymentMethod: "Bank Transfer",
    customFields: { "Invoice Number": "INV-001", "Customer": "John Doe" },
  },
  {
    id: "2",
    date: "2025-10-04",
    type: "expense",
    amount: 250.00,
    category: "Supplies",
    description: "Office supplies purchase",
    paymentMethod: "Cash",
    customFields: { "Vendor": "Office Depot" },
  },
  {
    id: "3",
    date: "2025-10-03",
    type: "income",
    amount: 3200.00,
    category: "Services",
    description: "Consulting service payment",
    paymentMethod: "Credit Card",
    customFields: { "Invoice Number": "INV-002", "Project": "Website Design" },
  },
];

const mockCustomFields: CustomField[] = [
  { id: "1", name: "Invoice Number", type: "text" },
  { id: "2", name: "Customer", type: "text" },
  { id: "3", name: "Vendor", type: "text" },
  { id: "4", name: "Project", type: "text" },
];

export default function BusinessTransactions() {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [customFields, setCustomFields] = useState(mockCustomFields);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [customFieldDialogOpen, setCustomFieldDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [importedTransactions, setImportedTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = totalIncome - totalExpense;

  const handleUploadComplete = (transactions: any[]) => {
    setImportedTransactions(transactions);
    setUploadDialogOpen(false);
    setReviewDialogOpen(true);
  };

  const handleSaveImportedTransactions = (transactions: any[]) => {
    console.log("Saving imported business transactions:", transactions);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Business Transactions</h1>
          <p className="text-muted-foreground">
            Manage daily cash transactions and generate reports
          </p>
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
            onClick={() => setCustomFieldDialogOpen(true)}
            data-testid="button-manage-fields"
          >
            <FileText className="h-4 w-4 mr-2" />
            Custom Fields
          </Button>
          <Button
            variant="outline"
            onClick={() => setReportDialogOpen(true)}
            data-testid="button-generate-report"
          >
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button
            onClick={() => setTransactionDialogOpen(true)}
            data-testid="button-add-transaction"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2" data-testid="text-total-income">
              ${totalIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3" data-testid="text-total-expenses">
              ${totalExpense.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Cash Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                netCashFlow >= 0 ? "text-chart-2" : "text-chart-3"
              }`}
              data-testid="text-net-cash-flow"
            >
              ${netCashFlow.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-transactions"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger data-testid="select-type-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="From Date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              data-testid="input-date-from"
            />

            <Input
              type="date"
              placeholder="To Date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              data-testid="input-date-to"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge
                      className={
                        transaction.type === "income"
                          ? "bg-chart-2 text-white"
                          : "bg-chart-3 text-white"
                      }
                      data-testid={`badge-type-${transaction.id}`}
                    >
                      {transaction.type}
                    </Badge>
                    <Badge variant="outline" data-testid={`badge-category-${transaction.id}`}>
                      {transaction.category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {transaction.date}
                    </span>
                  </div>

                  <h3 className="font-semibold mb-1" data-testid={`text-description-${transaction.id}`}>
                    {transaction.description}
                  </h3>

                  <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                    <span>Payment: {transaction.paymentMethod}</span>
                    {transaction.customFields &&
                      Object.entries(transaction.customFields).map(([key, value]) => (
                        <span key={key}>
                          {key}: <span className="font-medium">{value}</span>
                        </span>
                      ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xl font-bold whitespace-nowrap ${
                      transaction.type === "income" ? "text-chart-2" : "text-chart-3"
                    }`}
                    data-testid={`text-amount-${transaction.id}`}
                  >
                    {transaction.type === "income" ? "+" : "-"}$
                    {transaction.amount.toFixed(2)}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => console.log("Edit transaction:", transaction.id)}
                      data-testid={`button-edit-transaction-${transaction.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => console.log("Delete transaction:", transaction.id)}
                      data-testid={`button-delete-transaction-${transaction.id}`}
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

      <TransactionDialog
        open={transactionDialogOpen}
        onOpenChange={setTransactionDialogOpen}
        customFields={customFields}
        onSave={(transaction: any) => console.log("Save transaction:", transaction)}
      />

      <CustomFieldDialog
        open={customFieldDialogOpen}
        onOpenChange={setCustomFieldDialogOpen}
        customFields={customFields}
        onSave={(fields: any) => {
          setCustomFields(fields);
          console.log("Updated custom fields:", fields);
        }}
      />

      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        transactions={transactions}
        onGenerate={(format: any, filters: any) =>
          console.log("Generate report:", format, filters)
        }
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
