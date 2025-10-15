import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BankStatementUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: (transactions: any[]) => void;
}

export function BankStatementUpload({
  open,
  onOpenChange,
  onUploadComplete,
}: BankStatementUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileType = selectedFile.name.split(".").pop()?.toLowerCase();
      if (fileType === "pdf" || fileType === "csv") {
        setFile(selectedFile);
        setUploadStatus("idle");
      } else {
        setUploadStatus("error");
        alert("Please upload a PDF or CSV file");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadStatus("idle");

    //todo: remove mock functionality - Simulate file parsing
    setTimeout(() => {
      const mockTransactions = [
        {
          id: "import-1",
          date: "2025-10-01",
          description: "Starbucks Coffee",
          amount: 5.99,
          type: "debit",
          category: "",
          business: false,
        },
        {
          id: "import-2",
          date: "2025-10-02",
          description: "Amazon Purchase",
          amount: 45.50,
          type: "debit",
          category: "",
          business: false,
        },
        {
          id: "import-3",
          date: "2025-10-03",
          description: "Salary Deposit",
          amount: 3500.00,
          type: "credit",
          category: "",
          business: false,
        },
        {
          id: "import-4",
          date: "2025-10-04",
          description: "Shell Gas Station",
          amount: 52.30,
          type: "debit",
          category: "",
          business: false,
        },
        {
          id: "import-5",
          date: "2025-10-05",
          description: "Walmart Groceries",
          amount: 120.75,
          type: "debit",
          category: "",
          business: false,
        },
      ];

      setUploading(false);
      setUploadStatus("success");
      onUploadComplete?.(mockTransactions);
    }, 2000);
  };

  const handleClose = () => {
    setFile(null);
    setUploadStatus("idle");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Bank Statement</DialogTitle>
          <DialogDescription>
            Upload your bank statement in PDF or CSV format to automatically import transactions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {uploadStatus === "success" ? (
            <Alert className="border-chart-2 bg-chart-2/10">
              <CheckCircle className="h-4 w-4 text-chart-2" />
              <AlertDescription className="text-chart-2">
                Bank statement uploaded successfully! You can now review and categorize the transactions.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg hover-elevate">
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">Upload Bank Statement</h3>
                    <p className="text-sm text-muted-foreground mb-4 text-center">
                      Supports PDF and CSV formats
                    </p>
                    <label htmlFor="file-upload">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("file-upload")?.click()}
                        data-testid="button-select-file"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Select File
                      </Button>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.csv"
                      className="hidden"
                      onChange={handleFileSelect}
                      data-testid="input-file-upload"
                    />
                  </div>

                  {file && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFile(null)}
                          data-testid="button-remove-file"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> After uploading, you'll be able to review all transactions and assign
                  categories or mark them as business expenses.
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>

        <DialogFooter>
          {uploadStatus === "success" ? (
            <Button onClick={handleClose} data-testid="button-close-upload">
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={uploading}
                data-testid="button-cancel-upload"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                data-testid="button-upload-statement"
              >
                {uploading ? "Processing..." : "Upload & Parse"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
