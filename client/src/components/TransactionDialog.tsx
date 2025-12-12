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

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customFields: any[];
  onSave?: (transaction: any) => void;
  transaction?: any;
}

const transactionTypes = ["income", "expense"];
const paymentMethods = ["Cash", "Bank Transfer", "Credit Card", "Debit Card", "Check", "Other"];

export function TransactionDialog({
  open,
  onOpenChange,
  customFields,
  onSave,
  transaction,
}: TransactionDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const categories = Array.isArray(user?.categories) 
    ? user.categories 
    : ["Sales", "Services", "Supplies", "Utilities", "Rent", "Salaries", "Other"];
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    type: "income",
    amount: "",
    category: "",
    description: "",
    paymentMethod: "",
    customFields: {} as Record<string, any>,
  });

  const [errors, setErrors] = useState({
    date: "",
    amount: "",
    category: "",
    description: "",
    paymentMethod: "",
  });

  useEffect(() => {
    if (transaction) {
      // Parse date and time from transaction.date (ISO format: YYYY-MM-DDTHH:mm:ss or YYYY-MM-DD)
      const dateTimeParts = transaction.date.includes('T') 
        ? transaction.date.split('T')
        : [transaction.date, '00:00'];
      const datePart = dateTimeParts[0];
      const timePart = dateTimeParts[1] ? dateTimeParts[1].slice(0, 5) : '00:00';
      
      setFormData({
        date: datePart,
        time: timePart,
        type: transaction.type,
        amount: transaction.amount.toString(),
        category: transaction.category,
        description: transaction.description,
        paymentMethod: transaction.paymentMethod,
        customFields: transaction.customFields || {},
      });
    } else {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        type: "income",
        amount: "",
        category: "",
        description: "",
        paymentMethod: "",
        customFields: {},
      });
    }
    // Reset errors when dialog opens/closes or transaction changes
    setErrors({
      date: "",
      amount: "",
      category: "",
      description: "",
      paymentMethod: "",
    });
  }, [transaction, open]);

  const validateForm = () => {
    const newErrors = {
      date: "",
      amount: "",
      category: "",
      description: "",
      paymentMethod: "",
    };

    let isValid = true;

    // Date validation
    if (!formData.date) {
      newErrors.date = "Date is required";
      isValid = false;
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today
      
      if (selectedDate > today) {
        newErrors.date = "Date cannot be in the future";
        isValid = false;
      }
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

    // Description validation
    if (!formData.description || formData.description.trim() === "") {
      newErrors.description = "Description is required";
      isValid = false;
    } else if (formData.description.length < 3) {
      newErrors.description = "Description must be at least 3 characters";
      isValid = false;
    } else if (formData.description.length > 500) {
      newErrors.description = "Description must not exceed 500 characters";
      isValid = false;
    }

    // Payment method validation
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
      isValid = false;
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

    // Combine date and time into ISO format
    const dateTimeString = `${formData.date}T${formData.time}:00`;
    const transactionData = {
      ...formData,
      date: dateTimeString,
    };
    // Remove time field from submission since it's now part of date
    delete (transactionData as any).time;

    onSave?.(transactionData);
    onOpenChange(false);
  };

  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setFormData({
      ...formData,
      customFields: {
        ...formData.customFields,
        [fieldName]: value,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date <span className="text-destructive">*</span></Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                data-testid="input-transaction-date"
                className={errors.date ? "border-destructive" : ""}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                data-testid="input-transaction-time"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type <span className="text-destructive">*</span></Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger data-testid="select-transaction-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {transactionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                data-testid="input-transaction-amount"
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
                <SelectTrigger data-testid="select-transaction-category" className={errors.category ? "border-destructive" : ""}>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method <span className="text-destructive">*</span></Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
            >
              <SelectTrigger data-testid="select-payment-method" className={errors.paymentMethod ? "border-destructive" : ""}>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-sm text-destructive">{errors.paymentMethod}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
            <Textarea
              id="description"
              placeholder="Transaction details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              data-testid="input-transaction-description"
              className={errors.description ? "border-destructive" : ""}
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {formData.description.length}/500
              </p>
            </div>
          </div>

          {customFields.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Custom Fields</h3>
              {customFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={`custom-${field.id}`}>{field.name}</Label>
                  {field.type === "select" && field.options ? (
                    <Select
                      value={formData.customFields[field.name] || ""}
                      onValueChange={(value) => handleCustomFieldChange(field.name, value)}
                    >
                      <SelectTrigger data-testid={`select-custom-${field.id}`}>
                        <SelectValue placeholder={`Select ${field.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option: string) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={`custom-${field.id}`}
                      type={field.type}
                      value={formData.customFields[field.name] || ""}
                      onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                      data-testid={`input-custom-${field.id}`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-transaction"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-save-transaction">
            Save Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
