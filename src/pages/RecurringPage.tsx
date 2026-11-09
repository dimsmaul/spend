import React, { useState } from "react";
import { Repeat, Plus, PauseCircle, PlayCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRecurringRules, useCreateRecurring, useToggleRecurring, useWallets } from "@/hooks/useData";

export const RecurringPage: React.FC = () => {
  const { data: rulesData = [], isLoading } = useRecurringRules();
  const { data: wallets = [] } = useWallets();
  const createRecurringMutation = useCreateRecurring();
  const toggleRecurringMutation = useToggleRecurring();

  const rules = rulesData.map((r) => ({
    id: r.id,
    name: r.name,
    amount: r.amount,
    category: r.category,
    walletName: r.wallet_name || "Dompet",
    interval: r.interval,
    nextDueDate: r.next_due_date,
    isActive: !r.is_paused,
  }));

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Tagihan");
  const [wallet, setWallet] = useState("");
  const [interval, setInterval] = useState<"MONTHLY" | "WEEKLY" | "YEARLY">("MONTHLY");
  const [nextDate, setNextDate] = useState("");

  const totalMonthlyCommitment = rules
    .filter((r) => r.isActive)
    .reduce((sum, r) => sum + r.amount, 0);

  const handleAddRule = async () => {
    if (!name || !amount) return;
    const selectedW = wallets.find((w) => w.id === wallet || w.name === wallet) || wallets[0];
    await createRecurringMutation.mutateAsync({
      name,
      amount: parseInt(amount, 10),
      category,
      wallet_id: selectedW ? selectedW.id : undefined,
      interval,
      next_due_date: nextDate || new Date().toISOString().split("T")[0],
    });
    setName("");
    setAmount("");
    setNextDate("");
    setIsAddOpen(false);
  };

  const toggleActive = async (id: string) => {
    const target = rules.find((r) => r.id === id);
    if (!target) return;
    await toggleRecurringMutation.mutateAsync({
      id,
      isPaused: target.isActive, // If active, toggle to paused
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transaksi Berulang & Langganan</h1>
          <p className="text-sm text-muted-foreground">
            Jadwalkan tagihan rutin agar tercatat konsisten.
          </p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Tambah Jadwal Rutin
        </Button>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="text-xs">Komitmen Pengeluaran Rutin Bulanan</CardDescription>
          <div className="flex items-baseline justify-between mt-1">
            <CardTitle className="text-3xl font-bold">
              Rp {totalMonthlyCommitment.toLocaleString("id-ID")}
              <span className="text-sm font-normal text-muted-foreground"> / bulan</span>
            </CardTitle>
            <Badge variant="outline" className="text-xs font-normal">
              {rules.filter((r) => r.isActive).length} Langganan Aktif
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((r) => (
          <Card key={r.id} className="p-4 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                  <Repeat className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{r.name}</h4>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                      {r.category}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {r.interval}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>Sumber: {r.walletName}</span>
                    <span>•</span>
                    <span>Jatuh tempo: {r.nextDueDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <span className="text-sm font-bold">
                  Rp {r.amount.toLocaleString("id-ID")}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleActive(r.id)}
                  className="text-xs gap-1"
                >
                  {r.isActive ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                  {r.isActive ? "Jeda" : "Aktifkan"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Add Recurring */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Jadwal Transaksi Berulang</DialogTitle>
          </DialogHeader>
          <div className="space-y-3.5 py-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nama Pengeluaran</label>
              <Input
                placeholder="Contoh: Netflix, Listrik PLN, Cicilan Motor"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nominal (Rp)</label>
              <Input
                type="number"
                placeholder="Misal: 150000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Interval</label>
                <Select value={interval} onValueChange={(val) => val && setInterval(val as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Bulanan (Monthly)</SelectItem>
                    <SelectItem value="WEEKLY">Mingguan (Weekly)</SelectItem>
                    <SelectItem value="YEARLY">Tahunan (Yearly)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Sumber Dompet</label>
                <Select value={wallet} onValueChange={(val) => val && setWallet(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BCA">BCA</SelectItem>
                    <SelectItem value="Mandiri">Mandiri</SelectItem>
                    <SelectItem value="GoPay">GoPay</SelectItem>
                    <SelectItem value="Cash">Tunai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Tanggal Tagihan Berikutnya</label>
              <Input
                type="date"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddRule}>
              Simpan Jadwal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
