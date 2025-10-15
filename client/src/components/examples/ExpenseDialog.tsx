import { useState } from "react";
import { ExpenseDialog } from "../ExpenseDialog";
import { Button } from "@/components/ui/button";

export default function ExpenseDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open Expense Dialog</Button>
      <ExpenseDialog
        open={open}
        onOpenChange={setOpen}
        onSave={(expense) => console.log("Save expense:", expense)}
      />
    </div>
  );
}
