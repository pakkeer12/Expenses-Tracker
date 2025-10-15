import { ExpenseList } from "../ExpenseList";

const mockExpenses = [
  {
    id: "1",
    title: "Grocery Shopping",
    amount: 125.50,
    category: "Food",
    date: "2025-10-04",
    notes: "Weekly groceries",
  },
  {
    id: "2",
    title: "Uber to Work",
    amount: 15.00,
    category: "Transport",
    date: "2025-10-03",
  },
  {
    id: "3",
    title: "Netflix Subscription",
    amount: 15.99,
    category: "Entertainment",
    date: "2025-10-01",
  },
];

export default function ExpenseListExample() {
  return (
    <div className="p-8 max-w-3xl">
      <ExpenseList
        expenses={mockExpenses}
        onEdit={(expense) => console.log("Edit expense:", expense)}
        onDelete={(id) => console.log("Delete expense:", id)}
      />
    </div>
  );
}
