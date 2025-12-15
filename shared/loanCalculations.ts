/**
 * Loan calculation utilities for EMI, interest, and debt repayment strategies
 */

export interface LoanDetails {
  id: string;
  name: string;
  totalAmount: number;
  paidAmount: number;
  interestRate: number; // Annual interest rate in percentage
  tenure: number; // in months
  startDate: string;
  dueDate: string;
  calculationMethod: 'reducing' | 'flat';
  paymentFrequency: 'monthly' | 'quarterly' | 'yearly';
  emiAmount?: number;
  type: string;
  lender: string;
}

export interface EMIScheduleEntry {
  installmentNumber: number;
  date: string;
  emiAmount: number;
  principalAmount: number;
  interestAmount: number;
  remainingBalance: number;
}

export interface DebtRecommendation {
  loanId: string;
  loanName: string;
  priority: number;
  reason: string;
  potentialSavings?: number;
}

/**
 * Calculate EMI using the reducing balance method
 * Formula: EMI = [P x R x (1+R)^N]/[(1+R)^N-1]
 */
export function calculateEMIReducing(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number,
  frequency: 'monthly' | 'quarterly' | 'yearly' = 'monthly'
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualInterestRate === 0) return principal / tenureMonths;

  // Convert annual rate to periodic rate
  const periodsPerYear = frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : 1;
  const periodicRate = annualInterestRate / (100 * periodsPerYear);
  const totalPeriods = frequency === 'monthly' ? tenureMonths : 
                       frequency === 'quarterly' ? Math.ceil(tenureMonths / 3) :
                       Math.ceil(tenureMonths / 12);

  const emi =
    (principal *
      periodicRate *
      Math.pow(1 + periodicRate, totalPeriods)) /
    (Math.pow(1 + periodicRate, totalPeriods) - 1);

  return Math.round(emi * 100) / 100;
}

/**
 * Calculate EMI using the flat rate method
 */
export function calculateEMIFlat(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number,
  frequency: 'monthly' | 'quarterly' | 'yearly' = 'monthly'
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;

  const periodsPerYear = frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : 1;
  const totalPeriods = frequency === 'monthly' ? tenureMonths : 
                       frequency === 'quarterly' ? Math.ceil(tenureMonths / 3) :
                       Math.ceil(tenureMonths / 12);

  const totalInterest = (principal * annualInterestRate * (tenureMonths / 12)) / 100;
  const totalAmount = principal + totalInterest;
  const emi = totalAmount / totalPeriods;

  return Math.round(emi * 100) / 100;
}

/**
 * Calculate EMI based on the loan's calculation method
 */
export function calculateEMI(loan: Partial<LoanDetails>): number {
  const principal = (loan.totalAmount || 0) - (loan.paidAmount || 0);
  const method = loan.calculationMethod || 'reducing';
  const frequency = loan.paymentFrequency || 'monthly';

  if (method === 'flat') {
    return calculateEMIFlat(principal, loan.interestRate || 0, loan.tenure || 0, frequency);
  }
  return calculateEMIReducing(principal, loan.interestRate || 0, loan.tenure || 0, frequency);
}

/**
 * Calculate total interest payable over the loan tenure
 */
export function calculateTotalInterest(loan: Partial<LoanDetails>): number {
  const principal = loan.totalAmount || 0;
  const paidAmount = loan.paidAmount || 0;
  const remainingPrincipal = principal - paidAmount;
  const emi = loan.emiAmount || calculateEMI(loan);
  const tenure = loan.tenure || 0;
  
  if (loan.calculationMethod === 'flat') {
    const totalInterest = (principal * (loan.interestRate || 0) * (tenure / 12)) / 100;
    const paidPercentage = paidAmount / principal;
    return totalInterest * (1 - paidPercentage);
  }

  // For reducing balance
  const totalPayable = emi * tenure;
  const totalInterest = totalPayable - principal;
  const paidPercentage = paidAmount / principal;
  
  return Math.max(0, totalInterest * (1 - paidPercentage));
}

/**
 * Calculate the next EMI due date based on start date and payment frequency
 */
export function calculateNextEMIDate(
  startDate: string,
  paymentFrequency: 'monthly' | 'quarterly' | 'yearly',
  paidAmount: number,
  emiAmount: number
): string {
  const start = new Date(startDate);
  const paymentsMade = emiAmount > 0 ? Math.floor(paidAmount / emiAmount) : 0;
  
  const nextPaymentDate = new Date(start);
  
  if (paymentFrequency === 'monthly') {
    nextPaymentDate.setMonth(start.getMonth() + paymentsMade + 1);
  } else if (paymentFrequency === 'quarterly') {
    nextPaymentDate.setMonth(start.getMonth() + (paymentsMade + 1) * 3);
  } else {
    nextPaymentDate.setFullYear(start.getFullYear() + paymentsMade + 1);
  }
  
  return nextPaymentDate.toISOString().split('T')[0];
}

/**
 * Calculate remaining tenure in months
 */
export function calculateRemainingTenure(loan: Partial<LoanDetails>): number {
  const emi = loan.emiAmount || calculateEMI(loan);
  if (emi === 0) return 0;
  
  const remainingAmount = (loan.totalAmount || 0) - (loan.paidAmount || 0);
  return Math.ceil(remainingAmount / emi);
}

/**
 * Generate complete EMI amortization schedule
 */
export function generateAmortizationSchedule(loan: LoanDetails): EMIScheduleEntry[] {
  const schedule: EMIScheduleEntry[] = [];
  const periodicRate = (loan.interestRate / 100) / 12;
  let remainingBalance = loan.totalAmount - loan.paidAmount;
  const emi = loan.emiAmount || calculateEMI(loan);
  const startDate = new Date(loan.startDate);
  
  // Calculate how many payments have been made
  const paymentsMade = emi > 0 ? Math.floor(loan.paidAmount / emi) : 0;
  
  for (let i = paymentsMade + 1; i <= loan.tenure; i++) {
    if (remainingBalance <= 0) break;
    
    const interestAmount = loan.calculationMethod === 'reducing' 
      ? remainingBalance * periodicRate 
      : (loan.totalAmount * periodicRate);
    
    const principalAmount = Math.min(emi - interestAmount, remainingBalance);
    remainingBalance -= principalAmount;
    
    const paymentDate = new Date(startDate);
    if (loan.paymentFrequency === 'monthly') {
      paymentDate.setMonth(startDate.getMonth() + i);
    } else if (loan.paymentFrequency === 'quarterly') {
      paymentDate.setMonth(startDate.getMonth() + i * 3);
    } else {
      paymentDate.setFullYear(startDate.getFullYear() + i);
    }
    
    schedule.push({
      installmentNumber: i,
      date: paymentDate.toISOString().split('T')[0],
      emiAmount: Math.round(emi * 100) / 100,
      principalAmount: Math.round(principalAmount * 100) / 100,
      interestAmount: Math.round(interestAmount * 100) / 100,
      remainingBalance: Math.max(0, Math.round(remainingBalance * 100) / 100),
    });
  }
  
  return schedule;
}

/**
 * Calculate early payoff savings
 */
export function calculateEarlyPayoffSavings(
  loan: Partial<LoanDetails>,
  earlyPaymentAmount: number
): { savedInterest: number; reducedTenure: number } {
  const currentInterest = calculateTotalInterest(loan);
  const newPaidAmount = (loan.paidAmount || 0) + earlyPaymentAmount;
  const newLoan = { ...loan, paidAmount: newPaidAmount };
  const newInterest = calculateTotalInterest(newLoan);
  
  const currentTenure = calculateRemainingTenure(loan);
  const newTenure = calculateRemainingTenure(newLoan);
  
  return {
    savedInterest: Math.max(0, currentInterest - newInterest),
    reducedTenure: Math.max(0, currentTenure - newTenure),
  };
}

/**
 * Debt Avalanche Strategy: Prioritize loans with highest interest rate
 * This saves the most money on interest
 */
export function getDebtAvalancheRecommendations(loans: LoanDetails[]): DebtRecommendation[] {
  const activeLoans = loans.filter(loan => loan.totalAmount > loan.paidAmount);
  
  return activeLoans
    .sort((a, b) => b.interestRate - a.interestRate)
    .map((loan, index) => {
      const totalInterest = calculateTotalInterest(loan);
      return {
        loanId: loan.id,
        loanName: loan.name,
        priority: index + 1,
        reason: `${loan.interestRate}% interest rate - paying this first saves ₹${Math.round(totalInterest)} in interest`,
        potentialSavings: totalInterest,
      };
    });
}

/**
 * Debt Snowball Strategy: Prioritize loans with smallest balance
 * This provides psychological wins and momentum
 */
export function getDebtSnowballRecommendations(loans: LoanDetails[]): DebtRecommendation[] {
  const activeLoans = loans.filter(loan => loan.totalAmount > loan.paidAmount);
  
  return activeLoans
    .sort((a, b) => (a.totalAmount - a.paidAmount) - (b.totalAmount - b.paidAmount))
    .map((loan, index) => {
      const remainingAmount = loan.totalAmount - loan.paidAmount;
      return {
        loanId: loan.id,
        loanName: loan.name,
        priority: index + 1,
        reason: `Smallest balance (₹${Math.round(remainingAmount)}) - quick win builds momentum`,
      };
    });
}

/**
 * Get high-interest loans that should be prioritized
 */
export function getHighInterestLoans(loans: LoanDetails[], threshold: number = 10): LoanDetails[] {
  return loans
    .filter(loan => 
      loan.interestRate >= threshold && 
      loan.totalAmount > loan.paidAmount
    )
    .sort((a, b) => b.interestRate - a.interestRate);
}

/**
 * Calculate total interest across all active loans
 */
export function calculateTotalInterestAllLoans(loans: LoanDetails[]): number {
  return loans.reduce((total, loan) => {
    if (loan.totalAmount > loan.paidAmount) {
      return total + calculateTotalInterest(loan);
    }
    return total;
  }, 0);
}

/**
 * Get loans that are close to being paid off (within specified months)
 */
export function getLoansNearPayoff(loans: LoanDetails[], monthsThreshold: number = 3): LoanDetails[] {
  return loans
    .filter(loan => {
      const remainingTenure = calculateRemainingTenure(loan);
      return remainingTenure > 0 && remainingTenure <= monthsThreshold;
    })
    .sort((a, b) => calculateRemainingTenure(a) - calculateRemainingTenure(b));
}

/**
 * Calculate loan health status
 */
export function getLoanHealthStatus(loan: LoanDetails): {
  status: 'on-track' | 'ahead' | 'behind';
  message: string;
} {
  const expectedPaidPercentage = 
    ((new Date().getTime() - new Date(loan.startDate).getTime()) / 
     (new Date(loan.dueDate).getTime() - new Date(loan.startDate).getTime())) * 100;
  
  const actualPaidPercentage = (loan.paidAmount / loan.totalAmount) * 100;
  
  if (actualPaidPercentage >= expectedPaidPercentage + 5) {
    return {
      status: 'ahead',
      message: `You're ahead of schedule! ${Math.round(actualPaidPercentage - expectedPaidPercentage)}% ahead`,
    };
  } else if (actualPaidPercentage < expectedPaidPercentage - 5) {
    return {
      status: 'behind',
      message: `${Math.round(expectedPaidPercentage - actualPaidPercentage)}% behind schedule`,
    };
  }
  
  return {
    status: 'on-track',
    message: 'On track with payment schedule',
  };
}
