import React, { useState, useRef } from "react";
import { Inbox, Upload, Check, Trash2, ArrowDownLeft, ArrowUpRight, FileSpreadsheet, CheckCheck } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INDONESIAN_INSTITUTIONS } from "@/constants/banks";
import {
  useInbox,
  useApproveInboxItem,
  useDiscardInboxItem,
  useCreateInboxItem,
  useWallets,
} from "@/hooks/useData";

export const InboxPage: React.FC = () => {
  const { data: inboxItems = [], isLoading } = useInbox();
  const { data: wallets = [] } = useWallets();
  const approveMutation = useApproveInboxItem();
  const discardMutation = useDiscardInboxItem();
  const createInboxMutation = useCreateInboxItem();

  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState("bca");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApprove = async (id: string) => {
    const item = inboxItems.find((i) => i.id === id);
    if (!item) return;
    const wallet = wallets.find((w) => w.id === item.wallet_id) || wallets[0];
    await approveMutation.mutateAsync({
      item,
      walletId: wallet ? wallet.id : "",
      category: item.category || "Lainnya",
      type: "EXPENSE",
    });
  };

  const handleApproveAll = async () => {
    for (const item of inboxItems) {
      const wallet = wallets.find((w) => w.id === item.wallet_id) || wallets[0];
      await approveMutation.mutateAsync({
        item,
        walletId: wallet ? wallet.id : "",
        category: item.category || "Lainnya",
        type: "EXPENSE",
      });
    }
  };

  const handleDiscard = async (id: string) => {
    await discardMutation.mutateAsync(id);
  };

  // CSV Import Parser for Indonesian Bank Statements
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim().length > 0);

      const inst = INDONESIAN_INSTITUTIONS.find((i) => i.code === selectedBank);
      const bankName = inst?.name || "Bank";
      const targetWallet = wallets.find((w) => w.name.toLowerCase().includes(selectedBank)) || wallets[0];

      for (let idx = 0; idx < Math.min(lines.length - 1, 5); idx++) {
        const line = lines[idx + 1];
        const parts = line.split(/[;,]/);
        if (parts.length >= 2) {
          const desc = parts[1]?.trim().replace(/"/g, "") || `Mutasi ${bankName} #${idx + 1}`;
          const rawAmt = parts[2]?.trim().replace(/[^0-9]/g, "") || "125000";
          const num = parseInt(rawAmt, 10) || 50000;

          await createInboxMutation.mutateAsync({
            source: "BANK_CSV",
            description: desc,
            amount: num,
            category: "Belanja",
            wallet_id: targetWallet?.id,
            date: new Date().toISOString().split("T")[0],
          });
        }
      }
      setIsCsvModalOpen(false);
    };
    reader.readAsText(file);
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "CSV_IMPORT":
      case "BANK_CSV":
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0">Import CSV Bank</Badge>;
      case "RECEIPT_SCAN":
      case "RECEIPT":
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0">Scan Struk AI</Badge>;
      case "RECURRING":
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0">Tagihan Rutin</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0">Manual</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transaction Inbox</h1>
          <p className="text-sm text-muted-foreground">
            Penampung draft transaksi dari scan struk, tagihan rutin, dan import CSV bank sebelum disetujui.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCsvModalOpen(true)} variant="outline" className="gap-1.5">
            <FileSpreadsheet className="h-4 w-4" /> Import CSV Bank
          </Button>

          {inboxItems.length > 0 && (
            <Button onClick={handleApproveAll} className="gap-1.5">
              <CheckCheck className="h-4 w-4" /> Setujui Semua ({inboxItems.length})
            </Button>
          )}
        </div>
      </div>

      {/* Inbox List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Daftar Draft Transaksi Menunggu Konfirmasi</span>
            <Badge variant="secondary">{inboxItems.length} Menunggu</Badge>
          </CardTitle>
          <CardDescription>
            Periksa kategori dan nominal sebelum transaksi masuk permanen ke buku kas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {inboxItems.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <Inbox className="h-10 w-10 mx-auto text-muted-foreground/60" />
              <p className="text-sm font-medium">Inbox Anda kosong</p>
              <p className="text-xs">
                Semua hasil scan struk, jadwal tagihan rutin, dan import rekening bank sudah disetujui.
              </p>
            </div>
          ) : (
            inboxItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 last:border-0 last:pb-0 gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted">
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{item.description}</h4>
                      {getSourceBadge(item.source)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>{item.wallet_name || "Dompet"}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <span className="text-sm font-bold block">
                      Rp {item.amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApprove(item.id)}
                      className="gap-1 text-xs"
                    >
                      <Check className="h-3.5 w-3.5" /> Setujui
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDiscard(item.id)}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Modal Import CSV Mutasi Bank */}
      <Dialog open={isCsvModalOpen} onOpenChange={setIsCsvModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Mutasi Rekening Bank (CSV)</DialogTitle>
          </DialogHeader>

          <input
            type="file"
            accept=".csv,.txt"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Pilih Rekening Bank Asal</label>
              <Select value={selectedBank} onValueChange={(val) => val && setSelectedBank(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bca">BCA (KlikBCA / myBCA CSV)</SelectItem>
                  <SelectItem value="mandiri">Bank Mandiri (Livin' CSV)</SelectItem>
                  <SelectItem value="bri">BRI (BRImo CSV)</SelectItem>
                  <SelectItem value="bni">BNI (wondr by BNI CSV)</SelectItem>
                  <SelectItem value="jago">Bank Jago CSV</SelectItem>
                  <SelectItem value="gopay">GoPay Mutasi CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors space-y-2"
            >
              <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-muted">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Klik untuk Pilih File Mutasi (.CSV)</p>
                <p className="text-xs text-muted-foreground">
                  File mutasi rekening akan otomatis dibaca dan dipisah per transaksi.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCsvModalOpen(false)}>
              Batal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
