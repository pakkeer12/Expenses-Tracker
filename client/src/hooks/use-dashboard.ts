import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: string;
}

interface CategoryData {
  name: string;
  value: number;
}

interface MonthlyData {
  month: string;
  expenses: number;
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });
}

export function useCategoryBreakdown() {
  return useQuery<CategoryData[]>({
    queryKey: ["/api/dashboard/category-breakdown"],
  });
}

export function useMonthlyTrend() {
  return useQuery<MonthlyData[]>({
    queryKey: ["/api/dashboard/monthly-trend"],
  });
}
