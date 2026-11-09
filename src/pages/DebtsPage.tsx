import React, { useState } from "react";
import { Handshake, Plus, ArrowUpRight, ArrowDownLeft, Calendar } from "lucide-react";
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
import { useDebts, useCreateDebt, usePayDebt, useWallets } from "@/hooks/useData";

export const DebtsPage: React.FC = () => {
  const { data: debtsData = [], isLoading } = useDebts();
  const { data: wallets = [] } = useWallets();
  const createDebtMutation = useCreateDebt();
  const payDebtMutation = usePayDebt();

  const debts = debtsData.map((d) => ({
    id: d.id,
    type: d.type === "RECEIVABLE" ? ("OWED_TO_ME" as const) : ("OWED_BY_ME" as const),
    personName: d.person_name,
    totalAmount: d.amount,
    paidAmount: d.amount - d.remaining_amount,
    dueDate: d.due_date,
    notes: d.notes || "",
  }));

  const [activeTab, setActiveTab] = useState<"ALL" | "OWED_BY_ME" | "OWED_TO_ME">("ALL");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [type, setType] = useState<"OWED_TO_ME" | "OWED_BY_ME">("OWED_TO_ME");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const totalOwedToMe = debts.filter((d) => d.type === "OWED_TO_ME").reduce((acc, d) => acc + (d.totalAmount - d.paidAmount), 0);
  const totalOwedByMe = debts.filter((d) => d.type === "OWED_BY_ME").reduce((acc, d) => acc + (d.totalAmount - d.paidAmount), 0);

  const filteredDebts = debts.filter((d) => {
    if (activeTab === "ALL") return true;
    return d.type === activeTab;
  });

  const handleAddDebt = async () => {
    if (!name || !amount) return;
    await createDebtMutation.mutateAsync({
      type: type === "OWED_TO_ME" ? "RECEIVABLE" : "PAYABLE",
      person_name: name,
      amount: parseInt(amount, 10),
      due_date: dueDate || new Date().toISOString().split("T")[0],
      notes,
      wallet_id: wallets[0]?.id,
    });
    setName("");
    setAmount("");
    setDueDate("");
    setNotes("");
    setIsAddOpen(false);
  };

  const handlePayInstallment = async (id: string, payAmt: number) => {
    await payDebtMutation.mutateAsync({
      debtId: id,
      amount: payAmt,
      walletId: wallets[0]?.id,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Utang & Piutang</h1>
          <p className="text-sm text-muted-foreground">
            Catat pinjaman, uang yang dipinjamkan, dan cicilan agar terpantau.
          </p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Catat Utang / Piutang
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Piutang (Uang di Pihak Lain)</CardDescription>
            <CardTitle className="text-2xl font-bold">
              Rp {totalOwedToMe.toLocaleString("id-ID")}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Utang (Kewajiban Harus Dibayar)</CardDescription>
            <CardTitle className="text-2xl font-bold">
              Rp {totalOwedByMe.toLocaleString("id-ID")}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tab Filter */}
      <div className="flex items-center gap-1 border-b pb-2">
        <Button
          variant={activeTab === "ALL" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("ALL")}
          className="text-xs"
        >
          Semua
        </Button>
        <Button
          variant={activeTab === "OWED_TO_ME" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("OWED_TO_ME")}
          className="text-xs"
        >
          Piutang Saya
        </Button>
        <Button
          variant={activeTab === "OWED_BY_ME" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("OWED_BY_ME")}
          className="text-xs"
        >
          Utang Saya
        </Button>
      </div>

      {/* List Debts */}
      <div className="space-y-3">
        {filteredDebts.map((d) => {
          const remaining = d.totalAmount - d.paidAmount;
          const isLunas = remaining === 0;
          const pct = Math.round((d.paidAmount / d.totalAmount) * 100);

          return (
            <Card key={d.id} className="p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted">
                    {d.type === "OWED_TO_ME" ? (
                      <ArrowDownLeft className="h-4 w-4 text-foreground" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{d.personName}</h4>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                        {d.type === "OWED_TO_ME" ? "Piutang" : "Utang"}
                      </Badge>
                      {isLunas && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Lunas
                        </Badge>
                      )}
                    </div>
                    {d.notes && <p className="text-xs text-muted-foreground mt-0.5">{d.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 text-right">
                  <div>
                    <span className="text-xs text-muted-foreground block">Sisa Saldo</span>
                    <span className={`text-sm font-bold ${isLunas ? "line-through text-muted-foreground" : ""}`}>
                      Rp {remaining.toLocaleString("id-ID")}
                    </span>
                  </div>
                  {!isLunas && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePayInstallment(d.id, remaining)}
                      className="text-xs"
                    >
                      Lunasi
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <Progress value={pct} className="h-1.5" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Terbayar: Rp {d.paidAmount.toLocaleString("id-ID")} dari Rp {d.totalAmount.toLocaleString("id-ID")}</span>
                  <span>Jatuh Tempo: {d.dueDate}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal Add Debt */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Catat Utang atau Piutang</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={type === "OWED_TO_ME" ? "default" : "outline"}
                size="sm"
                onClick={() => setType("OWED_TO_ME")}
              >
                Piutang (Teman Pinjam)
              </Button>
              <Button
                type="button"
                variant={type === "OWED_BY_ME" ? "default" : "outline"}
                size="sm"
                onClick={() => setType("OWED_BY_ME")}
              >
                Utang (Saya Pinjam)
              </Button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nama Pihak / Teman / Bank</label>
              <Input
                placeholder="Misal: Andi, Kartu Kredit BCA"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Total Nominal (Rp)</label>
              <Input
                type="number"
                placeholder="Contoh: 1000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Estimasi Tanggal Jatuh Tempo</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Catatan Tambahan (Opsional)</label>
              <Input
                placeholder="Misal: Untuk bayar tiket konser"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddDebt}>
              Simpan Catatan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
