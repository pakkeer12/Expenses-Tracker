import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CustomFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customFields: any[];
  onSave?: (fields: any[]) => void;
}

const fieldTypes = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown" },
];

export function CustomFieldDialog({
  open,
  onOpenChange,
  customFields,
  onSave,
}: CustomFieldDialogProps) {
  const [fields, setFields] = useState(customFields);
  const [newField, setNewField] = useState({
    name: "",
    type: "text",
    options: [] as string[],
  });
  const [newOption, setNewOption] = useState("");

  const handleAddField = () => {
    if (newField.name.trim()) {
      const field = {
        id: Date.now().toString(),
        ...newField,
      };
      setFields([...fields, field]);
      setNewField({ name: "", type: "text", options: [] });
    }
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter((f: any) => f.id !== id));
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setNewField({
        ...newField,
        options: [...newField.options, newOption.trim()],
      });
      setNewOption("");
    }
  };

  const handleRemoveOption = (option: string) => {
    setNewField({
      ...newField,
      options: newField.options.filter((o) => o !== option),
    });
  };

  const handleSave = () => {
    onSave?.(fields);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Custom Fields</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Add New Field</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fieldName">Field Name</Label>
                    <Input
                      id="fieldName"
                      placeholder="Invoice Number"
                      value={newField.name}
                      onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                      data-testid="input-field-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fieldType">Field Type</Label>
                    <Select
                      value={newField.type}
                      onValueChange={(value) =>
                        setNewField({ ...newField, type: value, options: [] })
                      }
                    >
                      <SelectTrigger data-testid="select-field-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newField.type === "select" && (
                  <div className="space-y-2">
                    <Label>Dropdown Options</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add option"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddOption()}
                        data-testid="input-field-option"
                      />
                      <Button
                        type="button"
                        onClick={handleAddOption}
                        data-testid="button-add-option"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {newField.options.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newField.options.map((option) => (
                          <Badge key={option} variant="secondary" className="gap-1">
                            {option}
                            <button
                              onClick={() => handleRemoveOption(option)}
                              className="hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <Button onClick={handleAddField} data-testid="button-add-field">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h3 className="font-semibold">Current Custom Fields ({fields.length})</h3>
            {fields.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No custom fields added yet
              </p>
            ) : (
              <div className="space-y-2">
                {fields.map((field: any) => (
                  <Card key={field.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{field.name}</span>
                            <Badge variant="outline">
                              {fieldTypes.find((t) => t.value === field.type)?.label}
                            </Badge>
                          </div>
                          {field.type === "select" && field.options && (
                            <div className="flex gap-1 mt-2">
                              {field.options.map((option: string) => (
                                <Badge key={option} variant="secondary" className="text-xs">
                                  {option}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveField(field.id)}
                          data-testid={`button-remove-field-${field.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-fields"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-save-fields">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
