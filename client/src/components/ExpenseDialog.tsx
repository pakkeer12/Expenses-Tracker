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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (expense: any) => void;
  expense?: any;
}

export function ExpenseDialog({ open, onOpenChange, onSave, expense }: ExpenseDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const categories = Array.isArray(user?.categories) 
    ? user.categories 
    : ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Other"];
    
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [errors, setErrors] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title,
        amount: expense.amount.toString(),
        category: expense.category,
        date: expense.date,
        notes: expense.notes || "",
      });
    } else {
      setFormData({
        title: "",
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
    // Reset errors when dialog opens/closes or expense changes
    setErrors({
      title: "",
      amount: "",
      category: "",
      date: "",
    });
  }, [expense, open]);

  const validateForm = () => {
    const newErrors = {
      title: "",
      amount: "",
      category: "",
      date: "",
    };

    let isValid = true;

    // Title validation
    if (!formData.title || formData.title.trim() === "") {
      newErrors.title = "Title is required";
      isValid = false;
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
      isValid = false;
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must not exceed 100 characters";
      isValid = false;
    }

    // Amount validation
    if (!formData.amount || formData.amount.trim() === "") {
      newErrors.amount = "Amount is required";
      isValid = false;
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount)) {
        newErrors.amount = "Please enter a valid number";
        isValid = false;
      } else if (amount <= 0) {
        newErrors.amount = "Amount must be greater than 0";
        isValid = false;
      } else if (amount > 999999999) {
        newErrors.amount = "Amount is too large";
        isValid = false;
      } else if (!/^\d+(\.\d{1,2})?$/.test(formData.amount)) {
        newErrors.amount = "Amount can have at most 2 decimal places";
        isValid = false;
      }
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = "Category is required";
      isValid = false;
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = "Date is required";
      isValid = false;
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (selectedDate > today) {
        newErrors.date = "Date cannot be in the future";
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense" : "Add Expense"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              placeholder="Grocery shopping"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              data-testid="input-expense-title"
              className={errors.title ? "border-destructive" : ""}
              maxLength={100}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount <span className="text-destructive">*</span></Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              data-testid="input-expense-amount"
              className={errors.amount ? "border-destructive" : ""}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger data-testid="select-expense-category" className={errors.category ? "border-destructive" : ""}>
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
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date <span className="text-destructive">*</span></Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              data-testid="input-expense-date"
              className={errors.date ? "border-destructive" : ""}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional details..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              data-testid="input-expense-notes"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.notes.length}/500
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-expense">
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-save-expense">
            Save Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
