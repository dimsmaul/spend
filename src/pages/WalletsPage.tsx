import React, { useState } from "react";
import { Wallet, Plus, ArrowRightLeft, Landmark, Coins, Smartphone, Loader2 } from "lucide-react";
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
import { INDONESIAN_INSTITUTIONS } from "@/constants/banks";
import { useWallets, useCreateWallet, useTransferWallets } from "@/hooks/useData";

export const WalletsPage: React.FC = () => {
  const { data: wallets = [], isLoading } = useWallets();
  const createWalletMutation = useCreateWallet();
  const transferMutation = useTransferWallets();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const [selectedBankCode, setSelectedBankCode] = useState("bca");
  const [walletName, setWalletName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [accNum, setAccNum] = useState("");

  const [sourceWalletId, setSourceWalletId] = useState("");
  const [targetWalletId, setTargetWalletId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [adminFee, setAdminFee] = useState("0");

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  const handleAddWallet = async () => {
    const inst = INDONESIAN_INSTITUTIONS.find((i) => i.code === selectedBankCode);
    const type = inst?.types.includes("E-WALLET") ? "E_WALLET" : selectedBankCode === "cash" ? "CASH" : "BANK";
    await createWalletMutation.mutateAsync({
      name: walletName || inst?.name || "Dompet Baru",
      type,
      balance: parseInt(initialBalance, 10) || 0,
      currency: "IDR",
      icon: type === "BANK" ? "Landmark" : type === "E_WALLET" ? "Smartphone" : "Banknote",
    });
    setWalletName("");
    setInitialBalance("");
    setAccNum("");
    setIsAddOpen(false);
  };

  const handleTransfer = async () => {
    const fromId = sourceWalletId || wallets[0]?.id;
    const toId = targetWalletId || wallets[1]?.id;
    const amt = parseInt(transferAmount, 10);
    const fee = parseInt(adminFee, 10) || 0;
    if (!amt || !fromId || !toId || fromId === toId) return;

    await transferMutation.mutateAsync({
      fromWalletId: fromId,
      toWalletId: toId,
      amount: amt,
      adminFee: fee,
      note: "Transfer saldo",
    });

    setTransferAmount("");
    setAdminFee("0");
    setIsTransferOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "BANK":
        return <Landmark className="h-4 w-4" />;
      case "E_WALLET":
      case "E-WALLET":
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dompet & Rekening Bank</h1>
          <p className="text-sm text-muted-foreground">
            Kelola saldo semua rekening bank, e-wallet, dan uang tunai.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsTransferOpen(true)} variant="outline" className="gap-1.5">
            <ArrowRightLeft className="h-4 w-4" /> Transfer Antar Dompet
          </Button>

          <Button onClick={() => setIsAddOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Tambah Rekening
          </Button>
        </div>
      </div>

      {/* Global Liquidity Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="text-xs">Total Saldo Kas Likuid</CardDescription>
          <CardTitle className="text-3xl font-bold">
            Rp {totalBalance.toLocaleString("id-ID")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Tersebar di {wallets.length} akun aktif ({wallets.filter((w) => w.type === "BANK").length} bank, {wallets.filter((w) => w.type === "E_WALLET").length} e-wallet).
          </p>
        </CardContent>
      </Card>

      {/* Wallets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wallets.map((w) => (
          <Card key={w.id} className="space-y-3 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                  {getIcon(w.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{w.name}</h3>
                  <span className="text-xs text-muted-foreground font-mono block">
                    {w.accountNumber || "Tanpa No. Rekening"}
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                {w.type}
              </Badge>
            </div>

            <div className="pt-2 border-t flex justify-between items-baseline">
              <span className="text-xs text-muted-foreground">Saldo</span>
              <span className="text-base font-bold">
                Rp {w.balance.toLocaleString("id-ID")}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Add Wallet */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Rekening Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-3.5 py-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Pilih Bank / Dompet Digital</label>
              <Select value={selectedBankCode} onValueChange={(val) => val && setSelectedBankCode(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {INDONESIAN_INSTITUTIONS.map((inst) => (
                    <SelectItem key={inst.code} value={inst.code}>
                      {inst.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nama Label</label>
              <Input
                placeholder="Contoh: BCA Gaji, GoPay Belanja"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nomor Rekening / HP (Opsional)</label>
              <Input
                placeholder="Misal: 1234567890"
                value={accNum}
                onChange={(e) => setAccNum(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Saldo Awal (Rp)</label>
              <Input
                type="number"
                placeholder="0"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddWallet}>
              Simpan Rekening
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Transfer */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Saldo Antar Dompet</DialogTitle>
          </DialogHeader>
          <div className="space-y-3.5 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Dompet Asal</label>
                <Select value={sourceWalletId} onValueChange={(val) => val && setSourceWalletId(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Dompet Tujuan</label>
                <Select value={targetWalletId} onValueChange={(val) => val && setTargetWalletId(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nominal Transfer (Rp)</label>
              <Input
                type="number"
                placeholder="Contoh: 500000"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Biaya Admin (Rp)</label>
              <Input
                type="number"
                placeholder="0"
                value={adminFee}
                onChange={(e) => setAdminFee(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsTransferOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleTransfer}>
              Kirim Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
