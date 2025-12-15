import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLoanAnalytics, type EnrichedLoan } from "@/hooks/use-loan-analytics";
import { useCurrency } from "@/hooks/use-currency";
import { Skeleton } from "@/components/ui/skeleton";

interface LoanRecommendationsProps {
  loans: EnrichedLoan[];
}

export function LoanRecommendations({ loans }: LoanRecommendationsProps) {
  const { symbol } = useCurrency();
  const { data: analytics, isLoading } = useLoanAnalytics();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!analytics || analytics.activeLoans === 0) {
    return null;
  }

  const avalancheTop = analytics.avalanche[0];
  const snowballTop = analytics.snowball[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-chart-1" />
          Debt Repayment Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Debt Avalanche Strategy */}
        <div className="p-4 border rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">💰 Avalanche Method (Save Most Money)</h4>
            <Badge variant="default" className="bg-chart-1">Recommended</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Pay off highest interest rate loans first
          </p>
          {avalancheTop && (
            <div className="mt-3 p-3 bg-muted rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{avalancheTop.loanName}</p>
                  <p className="text-sm text-muted-foreground">{avalancheTop.reason}</p>
                </div>
                <Badge variant="outline" className="text-lg font-bold">#{avalancheTop.priority}</Badge>
              </div>
            </div>
          )}
        </div>

        {/* Debt Snowball Strategy */}
        <div className="p-4 border rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">🎯 Snowball Method (Build Momentum)</h4>
            <Badge variant="secondary">Alternative</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Pay off smallest balances first for quick wins
          </p>
          {snowballTop && (
            <div className="mt-3 p-3 bg-muted rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{snowballTop.loanName}</p>
                  <p className="text-sm text-muted-foreground">{snowballTop.reason}</p>
                </div>
                <Badge variant="outline" className="text-lg font-bold">#{snowballTop.priority}</Badge>
              </div>
            </div>
          )}
        </div>

        {/* High Interest Alert */}
        {analytics.highInterest.length > 0 && (
          <div className="p-4 border border-destructive/50 rounded-lg space-y-2 bg-destructive/5">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <h4 className="font-semibold text-destructive">High Interest Loans Alert</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              You have {analytics.highInterest.length} loan(s) with interest rate above 10%
            </p>
            <div className="space-y-2 mt-2">
              {analytics.highInterest.slice(0, 2).map((loan) => (
                <div key={loan.id} className="flex items-center justify-between text-sm">
                  <span>{loan.name}</span>
                  <Badge variant="destructive">{loan.interestRate}% APR</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Near Payoff */}
        {analytics.nearPayoff.length > 0 && (
          <div className="p-4 border border-chart-2/50 rounded-lg space-y-2 bg-chart-2/5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-chart-2" />
              <h4 className="font-semibold text-chart-2">Almost Done!</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {analytics.nearPayoff.length} loan(s) are within 3 months of being paid off
            </p>
            <div className="space-y-2 mt-2">
              {analytics.nearPayoff.map((loan) => {
                const remaining = loan.totalAmount - loan.paidAmount;
                return (
                  <div key={loan.id} className="flex items-center justify-between text-sm">
                    <span>{loan.name}</span>
                    <span className="font-medium">{symbol}{Math.round(remaining).toLocaleString()} left</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Total Interest Warning */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Interest Remaining</p>
              <p className="text-2xl font-bold text-destructive">
                {symbol}{Math.round(analytics.totalInterest).toLocaleString()}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Following the avalanche method can help minimize this amount
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
