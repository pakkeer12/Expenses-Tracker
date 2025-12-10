import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { X, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { currencies } from "@/hooks/use-currency";



const defaultCategories = ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Healthcare", "Education"];

export default function Settings() {
  const { user, refetchUser } = useAuth();
  const { toast } = useToast();
  const [currency, setCurrency] = useState("USD");
  const [categories, setCategories] = useState(defaultCategories);
  const [newCategory, setNewCategory] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setCurrency(user.currency || "USD");
      setCategories(user.categories || defaultCategories);
    }
  }, [user]);

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (category: string) => {
    setCategories(categories.filter((c) => c !== category));
  };

  const handleSaveCurrency = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/auth/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to save currency");
      }

      await refetchUser();
      toast({
        title: "Currency saved",
        description: "Your currency preference has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save currency",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCategories = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/auth/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to save categories");
      }

      await refetchUser();
      toast({
        title: "Categories saved",
        description: "Your categories have been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save categories",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Customize your expense tracker preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Currency Settings</CardTitle>
          <CardDescription>Choose your preferred currency for all transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Default Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger data-testid="select-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.name} ({curr.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Selected:</span>
            <Badge data-testid="badge-selected-currency">
              {currencies.find((c) => c.code === currency)?.symbol} {currency}
            </Badge>
          </div>
          <Button onClick={handleSaveCurrency} disabled={saving} data-testid="button-save-currency">
            {saving ? "Saving..." : "Save Currency"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
          <CardDescription>Add or remove expense categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter new category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
              data-testid="input-new-category"
            />
            <Button onClick={handleAddCategory} data-testid="button-add-category">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <Separator />

          <div>
            <Label className="text-sm text-muted-foreground mb-3 block">
              Your Categories ({categories.length})
            </Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="px-3 py-1.5 flex items-center gap-2"
                  data-testid={`badge-category-${category.toLowerCase()}`}
                >
                  {category}
                  <button
                    onClick={() => handleRemoveCategory(category)}
                    className="hover:text-destructive"
                    data-testid={`button-remove-category-${category.toLowerCase()}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          <Button onClick={handleSaveCategories} disabled={saving} data-testid="button-save-categories">
            {saving ? "Saving..." : "Save Categories"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
