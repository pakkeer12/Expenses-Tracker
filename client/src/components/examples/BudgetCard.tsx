import { BudgetCard } from "../BudgetCard";

export default function BudgetCardExample() {
  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <BudgetCard
        id="1"
        category="Food"
        spent={450.00}
        limit={500.00}
        onEdit={(id) => console.log("Edit budget:", id)}
        onDelete={(id) => console.log("Delete budget:", id)}
      />
      <BudgetCard
        id="2"
        category="Transport"
        spent={180.00}
        limit={200.00}
        onEdit={(id) => console.log("Edit budget:", id)}
        onDelete={(id) => console.log("Delete budget:", id)}
      />
      <BudgetCard
        id="3"
        category="Entertainment"
        spent={320.00}
        limit={250.00}
        onEdit={(id) => console.log("Edit budget:", id)}
        onDelete={(id) => console.log("Delete budget:", id)}
      />
    </div>
  );
}
