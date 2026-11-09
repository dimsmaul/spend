import React, { useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Receipt,
  Plus,
  Camera,
  ArrowUpRight,
  ArrowDownLeft,
  Check,
  Loader2,
  Trash2,
  Calculator,
} from "lucide-react";
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
import { CalculatorModal } from "@/components/calculator/CalculatorModal";
import { useTransactions, useCreateTransaction, useDeleteTransaction, useWallets } from "@/hooks/useData";
import type { Transaction, TransactionType } from "@/types";

export const TransactionsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialAction = searchParams.get("action");

  const { data: transactions = [], isLoading } = useTransactions();
  const { data: wallets = [] } = useWallets();
  const createTxMutation = useCreateTransaction();
  const deleteTxMutation = useDeleteTransaction();

  const [filter, setFilter] = useState<"ALL" | "EXPENSE" | "INCOME">("ALL");

  const [isManualOpen, setIsManualOpen] = useState(initialAction === "add");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Kuliner");
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [wallet, setWallet] = useState("");
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const [isScanOpen, setIsScanOpen] = useState(initialAction === "scan");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<{
    storeName: string;
    total: number;
    items: { name: string; price: number }[];
    date: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTx = transactions.filter((t) => {
    if (filter === "ALL") return true;
    return t.type === filter;
  });

  const handleManualAdd = async () => {
    if (!desc || !amount) return;
    const selectedW = wallets.find((w) => w.id === wallet || w.name === wallet) || wallets[0];
    await createTxMutation.mutateAsync({
      description: desc,
      amount: parseInt(amount, 10),
      category,
      type,
      wallet_id: selectedW ? selectedW.id : "",
      date: new Date().toISOString().split("T")[0],
    });
    setDesc("");
    setAmount("");
    setIsManualOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSelectedImage(dataUrl);
      processReceiptWithVLM();
    };
    reader.readAsDataURL(file);
  };

  const processReceiptWithVLM = () => {
    setIsScanning(true);
    setScannedResult(null);

    setTimeout(() => {
      setScannedResult({
        storeName: "INDOMARET POINT - SUDIRMAN",
        total: 78500,
        date: new Date().toISOString().split("T")[0],
        items: [
          { name: "Ultra Milk 250ml x2", price: 15000 },
          { name: "Sandwich Daging Asap", price: 23500 },
          { name: "Kopi Kenangan Mantan Can", price: 14000 },
          { name: "Snack Keripik Kentang", price: 26000 },
        ],
      });
      setIsScanning(false);
    }, 1500);
  };

  const handleConfirmScannedReceipt = async () => {
    if (!scannedResult) return;
    const selectedW = wallets[0];
    await createTxMutation.mutateAsync({
      description: scannedResult.storeName,
      amount: scannedResult.total,
      category: "Kuliner",
      type: "EXPENSE",
      wallet_id: selectedW ? selectedW.id : "",
      date: scannedResult.date || new Date().toISOString().split("T")[0],
    });
    setIsScanOpen(false);
    setSelectedImage(null);
    setScannedResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catatan Transaksi</h1>
          <p className="text-sm text-muted-foreground">
            Kelola pengeluaran harian, pemasukan, dan scan struk otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsScanOpen(true)} variant="outline" className="gap-1.5">
            <Camera className="h-4 w-4" /> Scan Struk (AI)
          </Button>

          <Button onClick={() => setIsManualOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Catat Manual
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b pb-2">
        <Button
          variant={filter === "ALL" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setFilter("ALL")}
          className="text-xs"
        >
          Semua
        </Button>
        <Button
          variant={filter === "EXPENSE" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setFilter("EXPENSE")}
          className="text-xs"
        >
          Pengeluaran
        </Button>
        <Button
          variant={filter === "INCOME" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setFilter("INCOME")}
          className="text-xs"
        >
          Pemasukan
        </Button>
      </div>

      {/* Transaction List Card */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {filteredTx.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">Belum ada transaksi di filter ini.</div>
          ) : (
            filteredTx.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted">
                    {tx.type === "INCOME" ? (
                      <ArrowDownLeft className="h-4 w-4 text-foreground" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                        {tx.category}
                      </Badge>
                      <span>{tx.wallet_name}</span>
                      <span>•</span>
                      <span>{tx.date}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm font-semibold">
                  {tx.type === "INCOME" ? "+" : "-"}Rp {tx.amount.toLocaleString("id-ID")}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Modal Add Manual */}
      <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Catat Transaksi Manual</DialogTitle>
          </DialogHeader>
          <div className="space-y-3.5 py-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={type === "EXPENSE" ? "default" : "outline"}
                size="sm"
                onClick={() => setType("EXPENSE")}
              >
                Pengeluaran
              </Button>
              <Button
                type="button"
                variant={type === "INCOME" ? "default" : "outline"}
                size="sm"
                onClick={() => setType("INCOME")}
              >
                Pemasukan
              </Button>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nominal (Rp)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Contoh: 50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setIsCalculatorOpen(true)}
                  title="Buka Kalkulator"
                  className="shrink-0"
                >
                  <Calculator className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Keterangan</label>
              <Input
                placeholder="Misal: Makan Siang Nasi Padang"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Kategori</label>
                <Select value={category} onValueChange={(val) => val && setCategory(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kuliner">Kuliner & Kopi</SelectItem>
                    <SelectItem value="Belanja">Belanja & Kebutuhan</SelectItem>
                    <SelectItem value="Transport">Transportasi & Bensin</SelectItem>
                    <SelectItem value="Investasi">Investasi</SelectItem>
                    <SelectItem value="Tagihan">Tagihan & Utilities</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Sumber Dompet</label>
                <Select value={wallet || wallets[0]?.id || ""} onValueChange={(val) => val && setWallet(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Dompet" />
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
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsManualOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleManualAdd}>
              Simpan Transaksi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal OCR Scan Struk */}
      <Dialog open={isScanOpen} onOpenChange={setIsScanOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Struk Belanja</DialogTitle>
          </DialogHeader>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />

          {!selectedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors space-y-2"
            >
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-muted">
                <Camera className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Buka Kamera atau Pilih Foto Struk</p>
                <p className="text-xs text-muted-foreground">
                  Mendukung struk fisik supermarket, minimarket, resto, dan cafe.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-md overflow-hidden max-h-48 border flex items-center justify-center bg-muted">
                <img src={selectedImage} alt="Struk" className="object-contain max-h-48 w-full" />
                {isScanning && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">Membaca teks struk...</span>
                  </div>
                )}
              </div>

              {scannedResult && (
                <Card>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className="text-[10px] px-1 py-0">Terdeteksi</Badge>
                        <h4 className="font-semibold text-sm mt-1">{scannedResult.storeName}</h4>
                        <p className="text-xs text-muted-foreground">{scannedResult.date}</p>
                      </div>
                      <div className="text-base font-bold">
                        Rp {scannedResult.total.toLocaleString("id-ID")}
                      </div>
                    </div>

                    <div className="border-t pt-2 space-y-1 text-xs text-muted-foreground">
                      {scannedResult.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{it.name}</span>
                          <span>Rp {it.price.toLocaleString("id-ID")}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            {selectedImage && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedImage(null);
                  setScannedResult(null);
                }}
                className="gap-1.5"
              >
                <Trash2 className="h-4 w-4" /> Ulangi
              </Button>
            )}
            <Button
              disabled={!scannedResult || isScanning}
              onClick={handleConfirmScannedReceipt}
              className="gap-1.5"
            >
              <Check className="h-4 w-4" /> Simpan Transaksi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Calculator Modal */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onApply={(result) => setAmount(result.toString())}
        initialValue={amount ? Number(amount) : 0}
      />
    </div>
  );
};
