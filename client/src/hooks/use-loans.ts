import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Loan, LoanPayment } from "@shared/schema";

export function useLoans() {
  return useQuery<Loan[]>({
    queryKey: ["/api/loans"],
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<Loan, "id" | "userId" | "createdAt">) => {
      const res = await apiRequest("POST", "/api/loans", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
    },
  });
}

export function useUpdateLoan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Loan> }) => {
      const res = await apiRequest("PUT", `/api/loans/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
    },
  });
}

export function useDeleteLoan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/loans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
    },
  });
}

export function useLoanPayments(loanId: string) {
  return useQuery<LoanPayment[]>({
    queryKey: [`/api/loans/${loanId}/payments`],
    enabled: !!loanId,
  });
}

export function useCreateLoanPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ loanId, data }: { loanId: string; data: Omit<LoanPayment, "id" | "loanId" | "createdAt"> }) => {
      const res = await apiRequest("POST", `/api/loans/${loanId}/payments`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
    },
  });
}

export function useDeleteLoanPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/payments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
    },
  });
}
