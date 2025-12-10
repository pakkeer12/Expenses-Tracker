import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: any;
  onSave?: () => void;
}

export function PaymentDialog({ open, onOpenChange, loan, onSave }: PaymentDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    if (open) {
      setFormData({
        amount: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
  }, [open]);

  const createPaymentMutation = useMutation({
    mutationFn: (payment: any) => 
      apiRequest(`/api/loans/${loan?.id}/payments`, "POST", payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      toast({
        title: "Payment added",
        description: "Your payment has been recorded successfully.",
      });
      onSave?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add payment",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    // Convert amount to number before submitting
    const paymentData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };
    createPaymentMutation.mutate(paymentData);
  };

  if (!loan) return null;

  const remaining = Number(loan.totalAmount) - Number(loan.paidAmount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
          <DialogDescription>
            Record a payment for {loan.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-3 rounded-lg bg-muted">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Remaining Balance</span>
              <span className="font-semibold">${remaining.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="500.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              data-testid="input-payment-amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Payment Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              data-testid="input-payment-date"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Payment details..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              data-testid="input-payment-notes"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-payment">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={createPaymentMutation.isPending}
            data-testid="button-save-payment"
          >
            {createPaymentMutation.isPending ? "Adding..." : "Add Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
