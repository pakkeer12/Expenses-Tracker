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
import { useToast } from "@/hooks/use-toast";

interface LoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (loan: any) => void;
  loan?: any;
}

const loanTypes = ["personal", "business", "auto", "mortgage"];

export function LoanDialog({ open, onOpenChange, onSave, loan }: LoanDialogProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    totalAmount: "",
    paidAmount: "0",
    interestRate: "",
    dueDate: "",
    lender: "",
    type: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    totalAmount: "",
    paidAmount: "",
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
    // Reset errors
    setErrors({
      name: "",
      totalAmount: "",
      paidAmount: "",
      interestRate: "",
      dueDate: "",
      lender: "",
      type: "",
    });
  }, [loan, open]);

  const validateForm = () => {
    const newErrors = {
      name: "",
      totalAmount: "",
      paidAmount: "",
      interestRate: "",
      dueDate: "",
      lender: "",
      type: "",
    };

    let isValid = true;

    // Name validation
    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Loan name is required";
      isValid = false;
    } else if (formData.name.length < 3) {
      newErrors.name = "Loan name must be at least 3 characters";
      isValid = false;
    } else if (formData.name.length > 100) {
      newErrors.name = "Loan name must not exceed 100 characters";
      isValid = false;
    }

    // Type validation
    if (!formData.type) {
      newErrors.type = "Loan type is required";
      isValid = false;
    }

    // Total amount validation
    if (!formData.totalAmount || formData.totalAmount.trim() === "") {
      newErrors.totalAmount = "Total amount is required";
      isValid = false;
    } else {
      const total = parseFloat(formData.totalAmount);
      if (isNaN(total)) {
        newErrors.totalAmount = "Please enter a valid number";
        isValid = false;
      } else if (total <= 0) {
        newErrors.totalAmount = "Total amount must be greater than 0";
        isValid = false;
      } else if (total > 999999999) {
        newErrors.totalAmount = "Total amount is too large";
        isValid = false;
      }
    }

    // Paid amount validation
    if (formData.paidAmount && formData.paidAmount.trim() !== "") {
      const paid = parseFloat(formData.paidAmount);
      const total = parseFloat(formData.totalAmount);
      if (isNaN(paid)) {
        newErrors.paidAmount = "Please enter a valid number";
        isValid = false;
      } else if (paid < 0) {
        newErrors.paidAmount = "Paid amount cannot be negative";
        isValid = false;
      } else if (!isNaN(total) && paid > total) {
        newErrors.paidAmount = "Paid amount cannot exceed total amount";
        isValid = false;
      }
    }

    // Interest rate validation
    if (!formData.interestRate || formData.interestRate.trim() === "") {
      newErrors.interestRate = "Interest rate is required";
      isValid = false;
    } else {
      const rate = parseFloat(formData.interestRate);
      if (isNaN(rate)) {
        newErrors.interestRate = "Please enter a valid number";
        isValid = false;
      } else if (rate < 0) {
        newErrors.interestRate = "Interest rate cannot be negative";
        isValid = false;
      } else if (rate > 100) {
        newErrors.interestRate = "Interest rate cannot exceed 100%";
        isValid = false;
      }
    }

    // Lender validation
    if (!formData.lender || formData.lender.trim() === "") {
      newErrors.lender = "Lender is required";
      isValid = false;
    } else if (formData.lender.length < 2) {
      newErrors.lender = "Lender name must be at least 2 characters";
      isValid = false;
    } else if (formData.lender.length > 100) {
      newErrors.lender = "Lender name must not exceed 100 characters";
      isValid = false;
    }

    // Due date validation
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
      isValid = false;
    } else {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        newErrors.dueDate = "Due date cannot be in the past";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive",
      });
      return;
    }

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
            <Label htmlFor="name">Loan Name <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              placeholder="Car Loan"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              data-testid="input-loan-name"
              className={errors.name ? "border-destructive" : ""}
              maxLength={100}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Loan Type <span className="text-destructive">*</span></Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger data-testid="select-loan-type" className={errors.type ? "border-destructive" : ""}>
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
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total Loan Amount <span className="text-destructive">*</span></Label>
            <Input
              id="totalAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="25000.00"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
              data-testid="input-loan-total"
              className={errors.totalAmount ? "border-destructive" : ""}
            />
            {errors.totalAmount && (
              <p className="text-sm text-destructive">{errors.totalAmount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidAmount">Amount Already Paid</Label>
            <Input
              id="paidAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="5000.00"
              value={formData.paidAmount}
              onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
              data-testid="input-loan-paid"
              className={errors.paidAmount ? "border-destructive" : ""}
            />
            {errors.paidAmount && (
              <p className="text-sm text-destructive">{errors.paidAmount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (%) <span className="text-destructive">*</span></Label>
            <Input
              id="interestRate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="4.5"
              value={formData.interestRate}
              onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
              data-testid="input-loan-interest"
              className={errors.interestRate ? "border-destructive" : ""}
            />
            {errors.interestRate && (
              <p className="text-sm text-destructive">{errors.interestRate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lender">Lender <span className="text-destructive">*</span></Label>
            <Input
              id="lender"
              placeholder="Bank of America"
              value={formData.lender}
              onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
              data-testid="input-loan-lender"
              className={errors.lender ? "border-destructive" : ""}
              maxLength={100}
            />
            {errors.lender && (
              <p className="text-sm text-destructive">{errors.lender}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date <span className="text-destructive">*</span></Label>
            <Input
              id="dueDate"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              data-testid="input-loan-due-date"
              className={errors.dueDate ? "border-destructive" : ""}
            />
            {errors.dueDate && (
              <p className="text-sm text-destructive">{errors.dueDate}</p>
            )}
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
