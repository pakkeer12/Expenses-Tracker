import { useQuery } from "@tanstack/react-query";
import type { LoanDetails, DebtRecommendation, EMIScheduleEntry } from "@shared/loanCalculations";

export interface LoanAnalytics {
  avalanche: DebtRecommendation[];
  snowball: DebtRecommendation[];
  highInterest: LoanDetails[];
  nearPayoff: LoanDetails[];
  totalInterest: number;
  totalLoans: number;
  activeLoans: number;
}

export interface EnrichedLoan extends LoanDetails {
  totalInterest: number;
  nextEMIDate: string;
  remainingTenure: number;
  healthStatus: 'on-track' | 'ahead' | 'behind';
  healthMessage: string;
}

/**
 * Hook to fetch loan analytics including debt repayment strategies
 */
export function useLoanAnalytics() {
  return useQuery<LoanAnalytics>({
    queryKey: ["/api/loans/analytics"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch amortization schedule for a specific loan
 */
export function useLoanSchedule(loanId: string | null) {
  return useQuery<EMIScheduleEntry[]>({
    queryKey: [`/api/loans/${loanId}/schedule`],
    enabled: !!loanId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get enriched loan data with calculated fields
 */
export function useEnrichedLoans() {
  return useQuery<EnrichedLoan[]>({
    queryKey: ["/api/loans"],
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Calculate savings from paying off a specific loan early
 */
export function calculatePotentialSavings(
  loan: EnrichedLoan,
  extraPayment: number
): { savedInterest: number; reducedMonths: number } {
  const currentRemainingInterest = loan.totalInterest;
  const currentRemainingTenure = loan.remainingTenure;
  
  // Simple approximation - in reality this would need the full calculation
  const paymentPercentage = extraPayment / (loan.totalAmount - loan.paidAmount);
  const savedInterest = currentRemainingInterest * paymentPercentage;
  const reducedMonths = Math.floor(currentRemainingTenure * paymentPercentage);
  
  return {
    savedInterest: Math.round(savedInterest),
    reducedMonths,
  };
}

/**
 * Get the best repayment strategy recommendation
 */
export function getBestStrategy(analytics: LoanAnalytics | undefined): {
  strategy: 'avalanche' | 'snowball' | 'balanced';
  reason: string;
  priorityLoanId: string | null;
} {
  if (!analytics || analytics.activeLoans === 0) {
    return {
      strategy: 'balanced',
      reason: 'No active loans',
      priorityLoanId: null,
    };
  }

  const highInterestCount = analytics.highInterest.length;
  const avgInterestSavings =
    analytics.avalanche.reduce((sum, rec) => sum + (rec.potentialSavings || 0), 0) /
    analytics.avalanche.length;

  // If there are high-interest loans and significant savings, recommend avalanche
  if (highInterestCount > 0 && avgInterestSavings > 10000) {
    return {
      strategy: 'avalanche',
      reason: `Focus on high-interest loans to save ₹${Math.round(avgInterestSavings)} per loan`,
      priorityLoanId: analytics.avalanche[0]?.loanId || null,
    };
  }

  // If loans are small and manageable, recommend snowball for momentum
  if (analytics.snowball.length > 0) {
    return {
      strategy: 'snowball',
      reason: 'Pay off smallest loans first to build momentum and reduce monthly obligations',
      priorityLoanId: analytics.snowball[0]?.loanId || null,
    };
  }

  return {
    strategy: 'balanced',
    reason: 'Maintain current payment strategy',
    priorityLoanId: null,
  };
}

/**
 * Calculate total monthly EMI across all active loans
 */
export function getTotalMonthlyEMI(loans: EnrichedLoan[]): number {
  return loans
    .filter(loan => loan.totalAmount > loan.paidAmount)
    .filter(loan => loan.paymentFrequency === 'monthly')
    .reduce((total, loan) => total + (loan.emiAmount || 0), 0);
}

/**
 * Get upcoming EMI payments (next 30 days)
 */
export function getUpcomingPayments(loans: EnrichedLoan[]): Array<{
  loanId: string;
  loanName: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
}> {
  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);

  return loans
    .filter(loan => loan.totalAmount > loan.paidAmount)
    .map(loan => {
      const dueDate = new Date(loan.nextEMIDate);
      const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        loanId: loan.id,
        loanName: loan.name,
        amount: loan.emiAmount || 0,
        dueDate: loan.nextEMIDate,
        daysUntilDue,
      };
    })
    .filter(payment => {
      const dueDate = new Date(payment.dueDate);
      return dueDate >= today && dueDate <= thirtyDaysLater;
    })
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}

/**
 * Calculate debt-to-income ratio (if income is provided)
 */
export function calculateDebtToIncomeRatio(
  loans: EnrichedLoan[],
  monthlyIncome: number
): number {
  const totalMonthlyEMI = getTotalMonthlyEMI(loans);
  if (monthlyIncome === 0) return 0;
  return (totalMonthlyEMI / monthlyIncome) * 100;
}

/**
 * Get loan summary statistics
 */
export function getLoanSummary(loans: EnrichedLoan[]): {
  totalBorrowed: number;
  totalPaid: number;
  totalRemaining: number;
  totalInterestPaid: number;
  totalInterestRemaining: number;
  averageInterestRate: number;
  loansAheadOfSchedule: number;
  loansBehindSchedule: number;
} {
  const activeLoans = loans.filter(loan => loan.totalAmount > loan.paidAmount);
  
  const totalBorrowed = loans.reduce((sum, loan) => sum + loan.totalAmount, 0);
  const totalPaid = loans.reduce((sum, loan) => sum + loan.paidAmount, 0);
  const totalRemaining = totalBorrowed - totalPaid;
  const totalInterestRemaining = activeLoans.reduce((sum, loan) => sum + loan.totalInterest, 0);
  
  // Estimate interest already paid (simplified calculation)
  const totalInterestPaid = loans.reduce((sum, loan) => {
    const paidPercentage = loan.paidAmount / loan.totalAmount;
    const estimatedTotalInterest = loan.totalInterest / (1 - paidPercentage || 1);
    return sum + (estimatedTotalInterest * paidPercentage);
  }, 0);
  
  const averageInterestRate =
    activeLoans.length > 0
      ? activeLoans.reduce((sum, loan) => sum + loan.interestRate, 0) / activeLoans.length
      : 0;
  
  const loansAheadOfSchedule = loans.filter(loan => loan.healthStatus === 'ahead').length;
  const loansBehindSchedule = loans.filter(loan => loan.healthStatus === 'behind').length;
  
  return {
    totalBorrowed: Math.round(totalBorrowed),
    totalPaid: Math.round(totalPaid),
    totalRemaining: Math.round(totalRemaining),
    totalInterestPaid: Math.round(totalInterestPaid),
    totalInterestRemaining: Math.round(totalInterestRemaining),
    averageInterestRate: Math.round(averageInterestRate * 100) / 100,
    loansAheadOfSchedule,
    loansBehindSchedule,
  };
}
