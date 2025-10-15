import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (loan: any) => void;
  loan?: any;
}

const loanTypes = ["personal", "business", "auto", "mortgage"];

export function LoanDialog({ open, onOpenChange, onSave, loan }: LoanDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    totalAmount: "",
    paidAmount: "0",
    interestRate: "",
    dueDate: "",
    lender: "",
    type: "",
  });

  useEffect(() => {
    if (loan) {
      setFormData({
        name: loan.name,
        totalAmount: loan.totalAmount.toString(),
        paidAmount: loan.paidAmount.toString(),
        interestRate: loan.interestRate.toString(),
        dueDate: loan.dueDate,
        lender: loan.lender,
        type: loan.type,
      });
    } else {
      setFormData({
        name: "",
        totalAmount: "",
        paidAmount: "0",
        interestRate: "",
        dueDate: "",
        lender: "",
        type: "",
      });
    }
  }, [loan, open]);

  const handleSave = () => {
    onSave?.(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{loan ? "Edit Loan" : "Add Loan"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="name">Loan Name</Label>
            <Input
              id="name"
              placeholder="Car Loan"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              data-testid="input-loan-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Loan Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger data-testid="select-loan-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {loanTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total Loan Amount</Label>
            <Input
              id="totalAmount"
              type="number"
              placeholder="25000.00"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
              data-testid="input-loan-total"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidAmount">Amount Already Paid</Label>
            <Input
              id="paidAmount"
              type="number"
              placeholder="5000.00"
              value={formData.paidAmount}
              onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
              data-testid="input-loan-paid"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.01"
              placeholder="4.5"
              value={formData.interestRate}
              onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
              data-testid="input-loan-interest"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lender">Lender</Label>
            <Input
              id="lender"
              placeholder="Bank of America"
              value={formData.lender}
              onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
              data-testid="input-loan-lender"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              data-testid="input-loan-due-date"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-loan">
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-save-loan">
            Save Loan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
