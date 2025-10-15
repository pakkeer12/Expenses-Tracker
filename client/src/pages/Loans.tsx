import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit, Trash2, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoanDialog } from "@/components/LoanDialog";
import { PaymentDialog } from "@/components/PaymentDialog";

interface Loan {
  id: string;
  name: string;
  totalAmount: number;
  paidAmount: number;
  interestRate: number;
  dueDate: string;
  lender: string;
  type: "personal" | "business" | "auto" | "mortgage";
}

//todo: remove mock functionality
const mockLoans: Loan[] = [
  {
    id: "1",
    name: "Car Loan",
    totalAmount: 25000,
    paidAmount: 12500,
    interestRate: 4.5,
    dueDate: "2026-12-31",
    lender: "Bank of America",
    type: "auto",
  },
  {
    id: "2",
    name: "Personal Loan",
    totalAmount: 10000,
    paidAmount: 7500,
    interestRate: 8.0,
    dueDate: "2025-06-30",
    lender: "Wells Fargo",
    type: "personal",
  },
  {
    id: "3",
    name: "Home Mortgage",
    totalAmount: 300000,
    paidAmount: 50000,
    interestRate: 3.25,
    dueDate: "2045-10-15",
    lender: "Chase Bank",
    type: "mortgage",
  },
];

const loanTypeColors: Record<string, string> = {
  personal: "bg-chart-1 text-white",
  business: "bg-chart-5 text-white",
  auto: "bg-chart-4 text-white",
  mortgage: "bg-chart-2 text-white",
};

export default function Loans() {
  const [loans, setLoans] = useState(mockLoans);
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const totalLoans = loans.reduce((sum, loan) => sum + loan.totalAmount, 0);
  const totalPaid = loans.reduce((sum, loan) => sum + loan.paidAmount, 0);
  const totalRemaining = totalLoans - totalPaid;

  const handleAddPayment = (loan: Loan) => {
    setSelectedLoan(loan);
    setPaymentDialogOpen(true);
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Loans</p>
              <p className="text-2xl font-bold" data-testid="text-total-loans">
                ${totalLoans.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-chart-2" data-testid="text-total-paid">
                ${totalPaid.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Remaining</p>
              <p className="text-2xl font-bold text-chart-3" data-testid="text-total-remaining">
                ${totalRemaining.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Progress
              value={(totalPaid / totalLoans) * 100}
              className="bg-chart-2"
            />
            <p className="text-sm text-muted-foreground text-center mt-2">
              {((totalPaid / totalLoans) * 100).toFixed(1)}% of total loans paid
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loans.map((loan) => {
          const remaining = loan.totalAmount - loan.paidAmount;
          const percentage = (loan.paidAmount / loan.totalAmount) * 100;
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
                    <span className="text-sm text-muted-foreground">{loan.interestRate}% APR</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => console.log("Edit loan:", loan.id)}
                    data-testid={`button-edit-loan-${loan.id}`}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => console.log("Delete loan:", loan.id)}
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
                      ${loan.paidAmount.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={Math.min(percentage, 100)} className="bg-chart-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className="font-semibold" data-testid={`text-loan-remaining-${loan.id}`}>
                      ${remaining.toLocaleString()}
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

      <LoanDialog
        open={loanDialogOpen}
        onOpenChange={setLoanDialogOpen}
        onSave={(loan: any) => console.log("Save loan:", loan)}
      />

      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        loan={selectedLoan}
        onSave={(payment: any) => console.log("Save payment:", payment)}
      />
    </div>
  );
}
