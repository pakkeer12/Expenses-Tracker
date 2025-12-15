import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { getUpcomingPayments, type EnrichedLoan } from "@/hooks/use-loan-analytics";
import { useCurrency } from "@/hooks/use-currency";
import { Badge } from "@/components/ui/badge";

interface UpcomingEMIPaymentsProps {
  loans: EnrichedLoan[];
}

export function UpcomingEMIPayments({ loans }: UpcomingEMIPaymentsProps) {
  const { symbol } = useCurrency();
  const upcomingPayments = getUpcomingPayments(loans);

  if (upcomingPayments.length === 0) {
    return null;
  }

  const getUrgencyColor = (days: number) => {
    if (days <= 3) return "destructive";
    if (days <= 7) return "default";
    return "secondary";
  };

  const getUrgencyText = (days: number) => {
    if (days === 0) return "Due Today";
    if (days === 1) return "Due Tomorrow";
    if (days < 0) return `${Math.abs(days)} days overdue`;
    return `${days} days`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-chart-3" />
          Upcoming EMI Payments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingPayments.map((payment) => (
            <div
              key={payment.loanId}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium">{payment.loanName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {new Date(payment.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right space-y-2">
                <p className="font-bold text-lg">
                  {symbol}{payment.amount.toLocaleString()}
                </p>
                <Badge variant={getUrgencyColor(payment.daysUntilDue)}>
                  {getUrgencyText(payment.daysUntilDue)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
