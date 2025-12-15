import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, Minus, TrendingDown } from "lucide-react";
import { getLoanSummary, type EnrichedLoan } from "@/hooks/use-loan-analytics";
import { useCurrency } from "@/hooks/use-currency";
import { Progress } from "@/components/ui/progress";

interface LoanHealthDashboardProps {
  loans: EnrichedLoan[];
}

export function LoanHealthDashboard({ loans }: LoanHealthDashboardProps) {
  const { symbol } = useCurrency();
  const summary = getLoanSummary(loans);

  const getHealthIcon = (count: number, total: number) => {
    const percentage = (count / total) * 100;
    if (percentage >= 50) return <TrendingUp className="h-4 w-4" />;
    if (percentage > 0) return <Minus className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-chart-4" />
          Loan Health Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Repayment Progress</span>
            <span className="font-medium">
              {summary.totalBorrowed > 0
                ? ((summary.totalPaid / summary.totalBorrowed) * 100).toFixed(1)
                : 0}%
            </span>
          </div>
          <Progress
            value={summary.totalBorrowed > 0 ? (summary.totalPaid / summary.totalBorrowed) * 100 : 0}
            className="h-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{symbol}{summary.totalPaid.toLocaleString()} paid</span>
            <span>{symbol}{summary.totalRemaining.toLocaleString()} remaining</span>
          </div>
        </div>

        {/* Health Status */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 border rounded-lg bg-chart-2/10">
            <div className="flex items-center justify-center gap-1 text-chart-2 mb-1">
              {getHealthIcon(summary.loansAheadOfSchedule, loans.length)}
              <span className="text-2xl font-bold">{summary.loansAheadOfSchedule}</span>
            </div>
            <p className="text-xs text-muted-foreground">Ahead</p>
          </div>

          <div className="text-center p-3 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Minus className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {loans.length - summary.loansAheadOfSchedule - summary.loansBehindSchedule}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">On Track</p>
          </div>

          <div className="text-center p-3 border rounded-lg bg-destructive/10">
            <div className="flex items-center justify-center gap-1 text-destructive mb-1">
              {getHealthIcon(summary.loansBehindSchedule, loans.length)}
              <span className="text-2xl font-bold">{summary.loansBehindSchedule}</span>
            </div>
            <p className="text-xs text-muted-foreground">Behind</p>
          </div>
        </div>

        {/* Interest Stats */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Interest Paid (est.)</span>
            <span className="font-semibold text-destructive">
              {symbol}{summary.totalInterestPaid.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Interest Remaining</span>
            <span className="font-semibold text-destructive">
              {symbol}{summary.totalInterestRemaining.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Avg. Interest Rate</span>
            <span className="font-semibold">{summary.averageInterestRate}%</span>
          </div>
        </div>

        {/* Actionable Insight */}
        {summary.totalInterestRemaining > 10000 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              💡 <strong>Tip:</strong> Making extra payments on high-interest loans could save you
              thousands in interest charges.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
