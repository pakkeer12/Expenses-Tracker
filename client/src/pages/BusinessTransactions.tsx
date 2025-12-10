import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { BusinessTransaction, CustomField } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useBusinessTransactions, useCreateBusinessTransaction, useCustomFields, useDeleteBusinessTransaction, useUpdateBusinessTransaction } from "@/hooks/use-business-transactions";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/use-currency";

export default function BusinessTransactions() {
  const {user}= useAuth()
  const { data: transactions = [], isLoading: transactionsLoading } = useBusinessTransactions();
  const createBussinessTransaction = useCreateBusinessTransaction();
  const updateBusinessTransaction = useUpdateBusinessTransaction();
  const deleteBusinessTransaction = useDeleteBusinessTransaction();
  const {symbol} = useCurrency();

  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [customFieldDialogOpen, setCustomFieldDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<BusinessTransaction | null>(null);
  const [importedTransactions, setImportedTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { toast } = useToast();



  const { data: customFields = [] } = useCustomFields();


  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = searchQuery
      ? transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesType = typeFilter === "all" ? true : transaction.type === typeFilter;

    const transactionDate = new Date(transaction.date);
    const matchesDateFrom = dateFrom ? transactionDate >= new Date(dateFrom) : true;
    const matchesDateTo = dateTo ? transactionDate <= new Date(dateTo) : true;

    return matchesSearch && matchesType && matchesDateFrom && matchesDateTo;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netCashFlow = totalIncome - totalExpense;

  const handleUploadComplete = (transactions: any[]) => {
    setImportedTransactions(transactions);
    setUploadDialogOpen(false);
    setReviewDialogOpen(true);
  };

  const handleSaveImportedTransactions = async (transactions: any[]) => {
    try {
      for (const transaction of transactions) {
        // Convert amount to number and ensure proper data format
        const transactionData = {
          ...transaction,
          amount: typeof transaction.amount === 'string' 
            ? parseFloat(transaction.amount) 
            : Number(transaction.amount),
          customFields: transaction.customFields && Object.keys(transaction.customFields).length > 0 
            ? transaction.customFields 
            : null,
        };
        await apiRequest("/api/business-transactions", "POST", transactionData);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/business-transactions"] });
      setReviewDialogOpen(false);
      toast({
        title: "Transactions imported",
        description: `${transactions.length} transactions have been imported successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to import transactions",
        variant: "destructive",
      });
    }
  };

  const handleSaveTransaction = async(transaction: any) => {
    try{
      // Convert amount to number and ensure proper data format
      const transactionData = {
        ...transaction,
        amount: parseFloat(transaction.amount),
        customFields: transaction.customFields && Object.keys(transaction.customFields).length > 0 
          ? transaction.customFields 
          : null,
      };

      if (editingTransaction) {
      await updateBusinessTransaction.mutateAsync({ id: editingTransaction.id, data: transactionData });
      setEditingTransaction(null);
      toast({
        title: "Transaction updated",
        description: "Your transaction has been updated successfully.",
      });
    } else {
      await createBussinessTransaction.mutateAsync(transactionData);
      setTransactionDialogOpen(false);
      toast({
        title: "Transaction created",
        description: "Your transaction has been created successfully.",
      });
    }
    }catch(error:any){
      toast({
        title: "Error",
        description: error.message || "Failed to save transaction",
        variant: "destructive",
      });
    }
    
  };

  const handleEditTransaction = (id: string) => {
    const transaction = transactions.find((t) => t.id === id);
    if (transaction) {
      setEditingTransaction(transaction);
      setTransactionDialogOpen(true);
    }
  };

  const handleDeleteTransaction = async(id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteBusinessTransaction.mutateAsync(id);
        toast({
        title: "Transaction deleted",
        description: "Your transaction has been deleted successfully.",
      });
      } catch (error: any) {
         toast({
        title: "Error",
        description: error.message || "Failed to delete transaction",
        variant: "destructive",
      });
      }
    }
  };

  const handleTransactionDialogClose = (open: boolean) => {
    setTransactionDialogOpen(open);
    if (!open) {
      setEditingTransaction(null);
    }
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
               {symbol} {totalIncome.toLocaleString()} 
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
               {symbol} {totalExpense.toLocaleString()} 
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
               {symbol} {netCashFlow.toLocaleString()} 
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

      {transactionsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTransactions.length > 0 ? (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
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
                      {transaction?.customFields as object &&
                        (Object.entries(transaction?.customFields ?? {}) as [string, any][]).map(([key, value]) => (
                          <span key={key}>
                            {key}: <span className="font-medium">{String(value)}</span>
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
                      {transaction.type === "income" ? "+" : "-"}{symbol}
                      {Number(transaction.amount).toFixed(2)}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTransaction(transaction.id)}
                        data-testid={`button-edit-transaction-${transaction.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTransaction(transaction.id)}
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
      ) : (
        <Card>
          <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
            {transactions.length === 0
              ? "No transactions yet. Click 'Add Transaction' to create one."
              : "No transactions match the current filters."}
          </CardContent>
        </Card>
      )}

      <TransactionDialog
        open={transactionDialogOpen}
        onOpenChange={handleTransactionDialogClose}
        transaction={editingTransaction}
        customFields={customFields}
        onSave={handleSaveTransaction}
      />

      <CustomFieldDialog
        open={customFieldDialogOpen}
        onOpenChange={setCustomFieldDialogOpen}
        customFields={customFields}
        onSave={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/custom-fields"] });
        }}
      />

      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        transactions={filteredTransactions}
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
