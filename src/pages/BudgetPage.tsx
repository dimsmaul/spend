import React, { useState } from "react";
import { PiggyBank, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useBudgets, useCreateBudget } from "@/hooks/useData";

export const BudgetPage: React.FC = () => {
  const currentPeriod = new Date().toISOString().slice(0, 7);
  const { data: budgetsData = [], isLoading } = useBudgets(currentPeriod);
  const createBudgetMutation = useCreateBudget();

  const budgets = budgetsData.map((b) => ({
    id: b.id,
    category: b.category,
    target: b.target_amount,
    spent: b.spent_amount,
  }));

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newTarget, setNewTarget] = useState("");

  const totalTarget = budgets.reduce((acc, curr) => acc + curr.target, 0) || 1;
  const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
  const remaining = totalTarget - totalSpent;
  const overallPct = Math.round((totalSpent / totalTarget) * 100);

  const handleAddBudget = async () => {
    if (!newCategory || !newTarget) return;
    await createBudgetMutation.mutateAsync({
      category: newCategory,
      target_amount: parseInt(newTarget, 10),
      spent_amount: 0,
      period: currentPeriod,
    });
    setNewCategory("");
    setNewTarget("");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Target Budget</h1>
          <p className="text-sm text-muted-foreground">
            Batas pengeluaran per kategori untuk mengendalikan arus kas bulanan.
          </p>
        </div>

        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Pasang Target Baru
        </Button>
      </div>

      {/* Global Overview Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Ringkasan Keseluruhan Bulan Ini</span>
            <span>{overallPct}% Terpakai</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <CardTitle className="text-3xl font-bold">
              Rp {totalSpent.toLocaleString("id-ID")}
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              Plafon: Rp {totalTarget.toLocaleString("id-ID")}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={overallPct} className="h-2" />
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Sisa Budget: Rp {remaining.toLocaleString("id-ID")}</span>
            <span>22 hari tersisa di periode ini</span>
          </div>
        </CardContent>
      </Card>

      {/* Category Budget Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {budgets.map((b) => {
          const pct = Math.round((b.spent / b.target) * 100);
          const isOver = b.spent > b.target;

          return (
            <Card key={b.id} className="space-y-3 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-base">{b.category}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Terpakai: Rp {b.spent.toLocaleString("id-ID")} / Rp {b.target.toLocaleString("id-ID")}
                  </p>
                </div>
                <Badge variant={isOver ? "destructive" : "secondary"}>
                  {pct}%
                </Badge>
              </div>

              <Progress value={Math.min(pct, 100)} className="h-2" />

              <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
                <span>
                  {isOver
                    ? `Over budget Rp ${(b.spent - b.target).toLocaleString("id-ID")}`
                    : `Sisa: Rp ${(b.target - b.spent).toLocaleString("id-ID")}`}
                </span>
                <span>Rata-rata: Rp {Math.round(b.spent / 8).toLocaleString("id-ID")}/hari</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal Add Budget */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Target Budget Kategori</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Nama Kategori</label>
              <Input
                placeholder="Misal: Liburan, Belanja Gadget"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Batas Nominal (Rp)</label>
              <Input
                type="number"
                placeholder="Misal: 1500000"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddBudget}>
              Simpan Target
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
