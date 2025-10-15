import { StatCard } from "../StatCard";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Total Balance"
        value="$5,240.50"
        icon={Wallet}
        trend="+12.5% from last month"
        trendUp={true}
      />
      <StatCard
        title="Total Income"
        value="$8,500.00"
        icon={TrendingUp}
        trend="+5.2% from last month"
        trendUp={true}
      />
      <StatCard
        title="Total Expenses"
        value="$3,259.50"
        icon={TrendingDown}
        trend="-3.1% from last month"
        trendUp={false}
      />
    </div>
  );
}
