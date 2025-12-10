import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit, Trash2, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoanDialog } from "@/components/LoanDialog";
import { PaymentDialog } from "@/components/PaymentDialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { Loan } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/use-currency";

const loanTypeColors: Record<string, string> = {
  personal: "bg-chart-1 text-white",
  business: "bg-chart-5 text-white",
  auto: "bg-chart-4 text-white",
  mortgage: "bg-chart-2 text-white",
};

export default function Loans() {
  const { symbol } = useCurrency();
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const { toast } = useToast();

  const { data: loans = [], isLoading } = useQuery<Loan[]>({
    queryKey: ["/api/loans"],
  });

  const createMutation = useMutation({
    mutationFn: (loan: any) => apiRequest("/api/loans", "POST", loan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      setLoanDialogOpen(false);
      toast({
        title: "Loan created",
        description: "Your loan has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create loan",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/loans/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      setEditingLoan(null);
      toast({
        title: "Loan updated",
        description: "Your loan has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update loan",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/loans/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      toast({
        title: "Loan deleted",
        description: "Your loan has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete loan",
        variant: "destructive",
      });
    },
  });

  const totalLoans = loans.reduce((sum, loan) => sum + Number(loan.totalAmount), 0);
  const totalPaid = loans.reduce((sum, loan) => sum + Number(loan.paidAmount), 0);
  const totalRemaining = totalLoans - totalPaid;

  const handleAddPayment = (loan: Loan) => {
    setSelectedLoan(loan);
    setPaymentDialogOpen(true);
  };

  const handleSaveLoan = (loan: any) => {
    // Convert amount fields to numbers
    const loanData = {
      ...loan,
      totalAmount: parseFloat(loan.totalAmount),
      paidAmount: parseFloat(loan.paidAmount),
      interestRate: parseFloat(loan.interestRate),
    };

    if (editingLoan) {
      updateMutation.mutate({ id: editingLoan.id, data: loanData });
    } else {
      createMutation.mutate(loanData);
    }
  };

  const handleEditLoan = (id: string) => {
    const loan = loans.find((l) => l.id === id);
    if (loan) {
      setEditingLoan(loan);
      setLoanDialogOpen(true);
    }
  };

  const handleDeleteLoan = (id: string) => {
    if (confirm("Are you sure you want to delete this loan?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleLoanDialogClose = (open: boolean) => {
    setLoanDialogOpen(open);
    if (!open) {
      setEditingLoan(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Loans</h1>
          <p className="text-muted-foreground">Track your loans and payment progress</p>
        </div>
        <Button onClick={() => setLoanDialogOpen(true)} data-testid="button-add-loan">
          <Plus className="h-4 w-4 mr-2" />
          Add Loan
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Loans</p>
                  <p className="text-2xl font-bold" data-testid="text-total-loans">
                    {symbol}{totalLoans.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
                  <p className="text-2xl font-bold text-chart-2" data-testid="text-total-paid">
                    {symbol}{totalPaid.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Remaining</p>
                  <p className="text-2xl font-bold text-chart-3" data-testid="text-total-remaining">
                    {symbol}{totalRemaining.toLocaleString()}
                  </p>
                </div>
              </div>
              {totalLoans > 0 && (
                <div className="mt-4">
                  <Progress
                    value={(totalPaid / totalLoans) * 100}
                    className="bg-chart-2"
                  />
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    {((totalPaid / totalLoans) * 100).toFixed(1)}% of total loans paid
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : loans.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loans.map((loan) => {
            const remaining = Number(loan.totalAmount) - Number(loan.paidAmount);
            const percentage = (Number(loan.paidAmount) / Number(loan.totalAmount)) * 100;
            return (
              <Card key={loan.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
                  <div className="space-y-1">
                    <CardTitle className="text-lg" data-testid={`text-loan-name-${loan.id}`}>
                      {loan.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={loanTypeColors[loan.type]} data-testid={`badge-loan-type-${loan.id}`}>
                        {loan.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{Number(loan.interestRate).toFixed(2)}% APR</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditLoan(loan.id)}
                      data-testid={`button-edit-loan-${loan.id}`}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteLoan(loan.id)}
                      data-testid={`button-delete-loan-${loan.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Paid</span>
                      <span className="font-semibold" data-testid={`text-loan-paid-${loan.id}`}>
                        {symbol}{Number(loan.paidAmount).toLocaleString()}
                      </span>
                    </div>
                    <Progress value={Math.min(percentage, 100)} className="bg-chart-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="font-semibold" data-testid={`text-loan-remaining-${loan.id}`}>
                        {symbol}{remaining.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Lender</span>
                      <span className="font-medium">{loan.lender}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Due Date</span>
                      <span className="font-medium">{loan.dueDate}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleAddPayment(loan)}
                    data-testid={`button-add-payment-${loan.id}`}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Add Payment
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
            No loans yet. Click "Add Loan" to create one.
          </CardContent>
        </Card>
      )}

      <LoanDialog
        open={loanDialogOpen}
        onOpenChange={handleLoanDialogClose}
        loan={editingLoan}
        onSave={handleSaveLoan}
      />

      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        loan={selectedLoan}
        onSave={() => {
          setPaymentDialogOpen(false);
          setSelectedLoan(null);
        }}
      />
    </div>
  );
}
