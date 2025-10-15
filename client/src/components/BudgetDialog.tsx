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

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (budget: any) => void;
  budget?: any;
}

const categories = ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Other"];

export function BudgetDialog({ open, onOpenChange, onSave, budget }: BudgetDialogProps) {
  const [formData, setFormData] = useState({
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
  }, [budget, open]);

  const handleSave = () => {
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
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger data-testid="select-budget-category">
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="limit">Monthly Limit</Label>
            <Input
              id="limit"
              type="number"
              placeholder="1000.00"
              value={formData.limit}
              onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
              data-testid="input-budget-limit"
            />
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
