import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: any[];
  onGenerate?: (format: string, filters: any) => void;
}

export function ReportDialog({
  open,
  onOpenChange,
  transactions,
  onGenerate,
}: ReportDialogProps) {
  const { user } = useAuth();
  const categories = Array.isArray(user?.categories) 
    ? user.categories 
    : ["Sales", "Services", "Supplies", "Utilities", "Rent", "Salaries", "Other"];
    
  const [format, setFormat] = useState("csv");
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    type: "all",
    category: "all",
    includeCustomFields: true,
  });

  const handleGenerate = () => {
    onGenerate?.(format, filters);
    console.log("Generating report:", { format, filters });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
          <DialogDescription>
            Export your business transactions with custom filters
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="format">Export Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger data-testid="select-report-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        CSV (Excel Compatible)
                      </div>
                    </SelectItem>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        PDF Document
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">From Date</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters({ ...filters, dateFrom: e.target.value })
                    }
                    data-testid="input-report-date-from"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateTo">To Date</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      setFilters({ ...filters, dateTo: e.target.value })
                    }
                    data-testid="input-report-date-to"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Transaction Type</Label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) =>
                      setFilters({ ...filters, type: value })
                    }
                  >
                    <SelectTrigger data-testid="select-report-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="income">Income Only</SelectItem>
                      <SelectItem value="expense">Expenses Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) =>
                      setFilters({ ...filters, category: value })
                    }
                  >
                    <SelectTrigger data-testid="select-report-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCustomFields"
                  checked={filters.includeCustomFields}
                  onCheckedChange={(checked) =>
                    setFilters({ ...filters, includeCustomFields: checked as boolean })
                  }
                  data-testid="checkbox-include-custom-fields"
                />
                <Label htmlFor="includeCustomFields" className="cursor-pointer">
                  Include custom fields in report
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {transactions.length} transactions will be included
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The report will include all filtered transactions with dates, amounts,
                    categories, and payment methods.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-report"
          >
            Cancel
          </Button>
          <Button onClick={handleGenerate} data-testid="button-generate-report">
            <Download className="h-4 w-4 mr-2" />
            Generate {format.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
