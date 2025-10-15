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

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customFields: any[];
  onSave?: (transaction: any) => void;
  transaction?: any;
}

const transactionTypes = ["income", "expense"];
const categories = ["Sales", "Services", "Supplies", "Utilities", "Rent", "Salaries", "Other"];
const paymentMethods = ["Cash", "Bank Transfer", "Credit Card", "Debit Card", "Check", "Other"];

export function TransactionDialog({
  open,
  onOpenChange,
  customFields,
  onSave,
  transaction,
}: TransactionDialogProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "income",
    amount: "",
    category: "",
    description: "",
    paymentMethod: "",
    customFields: {} as Record<string, any>,
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        date: transaction.date,
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
  }, [transaction, open]);

  const handleSave = () => {
    onSave?.(formData);
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
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                data-testid="input-transaction-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
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
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                data-testid="input-transaction-amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger data-testid="select-transaction-category">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
            >
              <SelectTrigger data-testid="select-payment-method">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Transaction details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              data-testid="input-transaction-description"
            />
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
