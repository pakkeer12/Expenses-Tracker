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
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (budget: any) => void;
  budget?: any;
}

export function BudgetDialog({ open, onOpenChange, onSave, budget }: BudgetDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const categories = Array.isArray(user?.categories) 
    ? user.categories 
    : ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Other"];
    
  const [formData, setFormData] = useState({
    category: "",
    limit: "",
  });

  const [errors, setErrors] = useState({
    category: "",
    limit: "",
  });

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category,
        limit: budget.limit.toString(),
      });
    } else {
      setFormData({
        category: "",
        limit: "",
      });
    }
    // Reset errors
    setErrors({
      category: "",
      limit: "",
    });
  }, [budget, open]);

  const validateForm = () => {
    const newErrors = {
      category: "",
      limit: "",
    };

    let isValid = true;

    // Category validation
    if (!formData.category) {
      newErrors.category = "Category is required";
      isValid = false;
    }

    // Limit validation
    if (!formData.limit || formData.limit.trim() === "") {
      newErrors.limit = "Budget limit is required";
      isValid = false;
    } else {
      const limit = parseFloat(formData.limit);
      if (isNaN(limit)) {
        newErrors.limit = "Please enter a valid number";
        isValid = false;
      } else if (limit <= 0) {
        newErrors.limit = "Budget limit must be greater than 0";
        isValid = false;
      } else if (limit > 999999999) {
        newErrors.limit = "Budget limit is too large";
        isValid = false;
      } else if (!/^\d+(\.\d{1,2})?$/.test(formData.limit)) {
        newErrors.limit = "Budget limit can have at most 2 decimal places";
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
          <DialogTitle>{budget ? "Edit Budget" : "Set Budget"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger data-testid="select-budget-category" className={errors.category ? "border-destructive" : ""}>
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
            <Label htmlFor="limit">Monthly Limit <span className="text-destructive">*</span></Label>
            <Input
              id="limit"
              type="number"
              step="0.01"
              min="0"
              placeholder="1000.00"
              value={formData.limit}
              onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
              data-testid="input-budget-limit"
              className={errors.limit ? "border-destructive" : ""}
            />
            {errors.limit && (
              <p className="text-sm text-destructive">{errors.limit}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-budget">
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-save-budget">
            Save Budget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
