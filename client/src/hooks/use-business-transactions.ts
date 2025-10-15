import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { BusinessTransaction, CustomField } from "@shared/schema";

export function useBusinessTransactions() {
  return useQuery<BusinessTransaction[]>({
    queryKey: ["/api/business-transactions"],
  });
}

export function useCreateBusinessTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<BusinessTransaction, "id" | "userId" | "createdAt">) => {
      const res = await apiRequest("POST", "/api/business-transactions", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });
}

export function useUpdateBusinessTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BusinessTransaction> }) => {
      const res = await apiRequest("PUT", `/api/business-transactions/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });
}

export function useDeleteBusinessTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/business-transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });
}

export function useCustomFields() {
  return useQuery<CustomField[]>({
    queryKey: ["/api/custom-fields"],
  });
}

export function useCreateCustomField() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<CustomField, "id" | "userId" | "createdAt">) => {
      const res = await apiRequest("POST", "/api/custom-fields", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-fields"] });
    },
  });
}

export function useUpdateCustomField() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CustomField> }) => {
      const res = await apiRequest("PUT", `/api/custom-fields/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-fields"] });
    },
  });
}

export function useDeleteCustomField() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/custom-fields/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-fields"] });
    },
  });
}
