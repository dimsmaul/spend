import React, { useState } from "react";
import { Target, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGoals, useCreateGoal, useDepositGoal, useWallets } from "@/hooks/useData";

export const GoalsPage: React.FC = () => {
  const { data: goalsData = [], isLoading } = useGoals();
  const { data: wallets = [] } = useWallets();
  const createGoalMutation = useCreateGoal();
  const depositGoalMutation = useDepositGoal();

  const goals = goalsData.map((g) => ({
    id: g.id,
    title: g.name,
    targetAmount: g.target_amount,
    savedAmount: g.current_amount,
    deadline: g.deadline || "2027-12-31",
    emoji: g.icon || "🎯",
  }));

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [initialSaved, setInitialSaved] = useState("");
  const [deadline, setDeadline] = useState("");
  const [emoji, setEmoji] = useState("🎯");

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");

  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.savedAmount, 0);
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleAddGoal = async () => {
    if (!title || !targetAmount) return;
    await createGoalMutation.mutateAsync({
      name: title,
      target_amount: parseInt(targetAmount, 10),
      current_amount: parseInt(initialSaved, 10) || 0,
      deadline: deadline || "2027-12-31",
      wallet_id: wallets[0]?.id,
    });
    setTitle("");
    setTargetAmount("");
    setInitialSaved("");
    setDeadline("");
    setIsAddOpen(false);
  };

  const handleDeposit = async () => {
    const amt = parseInt(depositAmount, 10);
    if (!amt || !selectedGoalId || !wallets[0]?.id) return;

    await depositGoalMutation.mutateAsync({
      goalId: selectedGoalId,
      amount: amt,
      walletId: wallets[0].id,
    });

    setDepositAmount("");
    setIsDepositOpen(false);
    setSelectedGoalId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Target Tabungan (Goals)</h1>
          <p className="text-sm text-muted-foreground">
            Wujudkan impian finansial dengan target nominal dan tenggat waktu.
          </p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Buat Target Baru
        </Button>
      </div>

      {/* Global Goals Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="text-xs">Akumulasi Seluruh Target Tabungan</CardDescription>
          <div className="flex items-baseline justify-between mt-1">
            <CardTitle className="text-3xl font-bold">
              Rp {totalSaved.toLocaleString("id-ID")}
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              Target: Rp {totalTarget.toLocaleString("id-ID")} ({overallPct}%)
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={overallPct} className="h-2" />
        </CardContent>
      </Card>

      {/* Goals Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((g) => {
          const pct = Math.round((g.savedAmount / g.targetAmount) * 100);
          const remaining = g.targetAmount - g.savedAmount;
          const isComplete = remaining === 0;

          return (
            <Card key={g.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 rounded-md border bg-muted">{g.emoji}</span>
                  <div>
                    <h3 className="font-semibold text-sm">{g.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Deadline: {g.deadline}</p>
                  </div>
                </div>

                <Badge variant={isComplete ? "default" : "secondary"}>
                  {isComplete ? "Tercapai" : `${pct}%`}
                </Badge>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Terkumpul: Rp {g.savedAmount.toLocaleString("id-ID")}</span>
                  <span>Target: Rp {g.targetAmount.toLocaleString("id-ID")}</span>
                </div>
                <Progress value={pct} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <span>Sisa: Rp {remaining.toLocaleString("id-ID")}</span>
                  {!isComplete && (
                    <button
                      onClick={() => {
                        setSelectedGoalId(g.id);
                        setIsDepositOpen(true);
                      }}
                      className="text-xs font-medium hover:underline text-foreground"
                    >
                      + Setor Tabungan
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal Add Goal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Target Tabungan Impian</DialogTitle>
          </DialogHeader>
          <div className="space-y-3.5 py-2">
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-1 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Emoji</label>
                <Input
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="text-center text-lg"
                />
              </div>
              <div className="col-span-3 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Nama Target</label>
                <Input
                  placeholder="Misal: Liburan Jepang, DP Mobil"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Target Nominal (Rp)</label>
              <Input
                type="number"
                placeholder="Misal: 25000000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Saldo Terkumpul Saat Ini (Rp)</label>
              <Input
                type="number"
                placeholder="0"
                value={initialSaved}
                onChange={(e) => setInitialSaved(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Target Tanggal</label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddGoal}>
              Simpan Target
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Setor Tabungan */}
      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Setor Tabungan ke Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nominal Setoran (Rp)</label>
              <Input
                type="number"
                placeholder="Misal: 1000000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDepositOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleDeposit}>
              Simpan Setoran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
