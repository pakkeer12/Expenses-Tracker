import { useState } from "react";
import { BudgetDialog } from "../BudgetDialog";
import { Button } from "@/components/ui/button";

export default function BudgetDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open Budget Dialog</Button>
      <BudgetDialog
        open={open}
        onOpenChange={setOpen}
        onSave={(budget) => console.log("Save budget:", budget)}
      />
    </div>
  );
}
