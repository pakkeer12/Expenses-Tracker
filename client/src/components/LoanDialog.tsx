import { useState, useEffect, useMemo } from "react";
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
import { calculateEMI } from "@shared/loanCalculations";
import { useCurrency } from "@/hooks/use-currency";

interface LoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (loan: any) => void;
  loan?: any;
}

const loanTypes = ["personal", "business", "auto", "mortgage"];
const paymentFrequencies = ["monthly", "quarterly", "yearly"];
const calculationMethods = [
  { value: "reducing", label: "Reducing Balance (EMI)" },
  { value: "flat", label: "Flat Rate" },
];

export function LoanDialog({ open, onOpenChange, onSave, loan }: LoanDialogProps) {
  const { toast } = useToast();
  const { symbol } = useCurrency();
  
  const [formData, setFormData] = useState({
    name: "",
    totalAmount: "",
    paidAmount: "0",
    interestRate: "",
    tenure: "",
    startDate: "",
    dueDate: "",
    lender: "",
    type: "",
    calculationMethod: "reducing",
    paymentFrequency: "monthly",
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

  // Calculate EMI automatically
  const calculatedEMI = useMemo(() => {
    if (!formData.totalAmount || !formData.interestRate || !formData.tenure) return 0;
    
    const principal = parseFloat(formData.totalAmount) - parseFloat(formData.paidAmount || "0");
    return calculateEMI({
      totalAmount: parseFloat(formData.totalAmount),
      paidAmount: parseFloat(formData.paidAmount || "0"),
      interestRate: parseFloat(formData.interestRate),
      tenure: parseInt(formData.tenure),
      calculationMethod: formData.calculationMethod as any,
      paymentFrequency: formData.paymentFrequency as any,
    });
  }, [formData.totalAmount, formData.paidAmount, formData.interestRate, formData.tenure, formData.calculationMethod, formData.paymentFrequency]);

  useEffect(() => {
    if (loan) {
      setFormData({
        name: loan.name,
        totalAmount: loan.totalAmount.toString(),
        paidAmount: loan.paidAmount.toString(),
        interestRate: loan.interestRate.toString(),
        tenure: loan.tenure?.toString() || "12",
        startDate: loan.startDate || new Date().toISOString().split("T")[0],
        dueDate: loan.dueDate,
        lender: loan.lender,
        type: loan.type,
        calculationMethod: loan.calculationMethod || "reducing",
        paymentFrequency: loan.paymentFrequency || "monthly",
      });
    } else {
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        name: "",
        totalAmount: "",
        paidAmount: "0",
        interestRate: "",
        tenure: "12",
        startDate: today,
        dueDate: "",
        lender: "",
        type: "",
        calculationMethod: "reducing",
        paymentFrequency: "monthly",
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
            <Label htmlFor="tenure">Loan Tenure (Months) <span className="text-destructive">*</span></Label>
            <Input
              id="tenure"
              type="number"
              step="1"
              min="1"
              placeholder="12"
              value={formData.tenure}
              onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
              data-testid="input-loan-tenure"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date <span className="text-destructive">*</span></Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              data-testid="input-loan-start-date"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentFrequency">Payment Frequency</Label>
            <Select
              value={formData.paymentFrequency}
              onValueChange={(value) => setFormData({ ...formData, paymentFrequency: value })}
            >
              <SelectTrigger data-testid="select-payment-frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {paymentFrequencies.map((freq) => (
                  <SelectItem key={freq} value={freq}>
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="calculationMethod">Calculation Method</Label>
            <Select
              value={formData.calculationMethod}
              onValueChange={(value) => setFormData({ ...formData, calculationMethod: value })}
            >
              <SelectTrigger data-testid="select-calculation-method">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {calculationMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Reducing balance calculates interest on remaining principal. Flat rate calculates on original amount.
            </p>
          </div>

          {calculatedEMI > 0 && (
            <div className="p-4 bg-muted rounded-lg space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Calculated EMI</p>
              <p className="text-2xl font-bold text-primary">
                {symbol}{calculatedEMI.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Per {formData.paymentFrequency === 'monthly' ? 'month' : formData.paymentFrequency === 'quarterly' ? 'quarter' : 'year'}
              </p>
            </div>
          )}

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
