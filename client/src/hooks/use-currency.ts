import { useAuth } from "@/contexts/AuthContext";

export const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
];

export function getCurrencySymbol(code: string) {
  const currency = currencies.find((c) => c.code === code);
  return currency ? currency.symbol : "$";
}

export function useCurrency() {
  const { user } = useAuth();
  const currency = user?.currency || "USD";
  const symbol = getCurrencySymbol(currency);
  return { currency, symbol };
}