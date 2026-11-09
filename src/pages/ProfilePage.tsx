import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Shield, Lock, Download, Moon, Sun, DollarSign, Database, Check, LogOut, LogIn } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useProfile, useUpdateProfile, useTransactions, useWallets } from "@/hooks/useData";
import { useAuth } from "@/context/AuthContext";

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const { data: transactions = [] } = useTransactions();
  const { data: wallets = [] } = useWallets();

  const [name, setName] = useState(user?.user_metadata?.name || profile?.name || "Dimas Maulana");
  const [email] = useState(user?.email || profile?.email || "dimas@example.com");
  const [currency, setCurrency] = useState(profile?.currency || "IDR");
  const [useDecimals, setUseDecimals] = useState(profile?.use_decimals || false);
  const [pinEnabled, setPinEnabled] = useState(profile?.pin_enabled || false);
  const [pinCode, setPinCode] = useState("");
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [newPin, setNewPin] = useState("");

  const handleSavePin = async () => {
    if (newPin.length === 4) {
      setPinCode(newPin);
      setPinEnabled(true);
      await updateProfileMutation.mutateAsync({ pin_enabled: true });
      setIsPinDialogOpen(false);
      setNewPin("");
    }
  };

  const handleExportJson = () => {
    const data = {
      appName: "Spend",
      exportedAt: new Date().toISOString(),
      user: { name, email, currency },
      wallets,
      transactions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spend-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,Tanggal,Deskripsi,Kategori,Jenis,Nominal,Dompet\n";
    transactions.forEach((tx) => {
      csvContent += `${tx.date},"${tx.description.replace(/"/g, '""')}",${tx.category},${tx.type},${tx.amount},${tx.wallet_name || ""}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `spend-transactions-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan & Profil</h1>
        <p className="text-sm text-muted-foreground">
          Kelola profil pengguna, preferensi mata uang, keamanan PIN, dan backup data.
        </p>
      </div>

      {/* Profil User Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" /> Informasi Pengguna
          </CardTitle>
          <CardDescription>Data profil dan identitas akun personal Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nama Tampilan</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Email Terdaftar</label>
              <Input value={email} disabled className="bg-muted text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferensi Keuangan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Preferensi Mata Uang & Angka
          </CardTitle>
          <CardDescription>Format tampilan nominal transaksi dan pembukuan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Mata Uang Utama</label>
              <Select value={currency} onValueChange={(val) => val && setCurrency(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR">IDR (Rupiah Indonesia - Rp)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar - $)</SelectItem>
                  <SelectItem value="SGD">SGD (Singapore Dollar - S$)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro - €)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-6 sm:pt-4">
              <div>
                <span className="text-sm font-medium block">Tampilkan Angka Desimal</span>
                <span className="text-xs text-muted-foreground">Tampilkan sen/desimal (misal: Rp 10.000,00)</span>
              </div>
              <Button
                variant={useDecimals ? "default" : "outline"}
                size="sm"
                onClick={() => setUseDecimals(!useDecimals)}
              >
                {useDecimals ? "Aktif" : "Nonaktif"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keamanan & PIN Lock */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" /> Keamanan & Kunci Aplikasi
          </CardTitle>
          <CardDescription>Kunci aplikasi dengan PIN 4 digit saat dibuka di perangkat mobile</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Kunci Layar dengan PIN</span>
              <Badge variant={pinEnabled ? "default" : "secondary"} className="text-[10px]">
                {pinEnabled ? "Aktif" : "Tidak Aktif"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {pinEnabled ? "PIN 4 digit sudah terpasang." : "Pasang PIN untuk melindungi privasi catatan keuangan Anda."}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPinDialogOpen(true)}
            className="gap-1.5"
          >
            <Lock className="h-4 w-4" /> {pinEnabled ? "Ubah PIN" : "Pasang PIN"}
          </Button>
        </CardContent>
      </Card>

      {/* Status Akun & Sesi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" /> Status Akun & Sesi
          </CardTitle>
          <CardDescription>
            {user ? `Sedang login sebagai ${user.email}` : "Anda sedang menggunakan mode Tamu / Offline"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" /> Keluar dari Akun (Logout)
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/login")}
              className="gap-2"
            >
              <LogIn className="h-4 w-4" /> Masuk atau Buat Akun Baru
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Backup & Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4" /> Cadangan & Ekspor Data
          </CardTitle>
          <CardDescription>Unduh salinan data keuangan Anda kapan saja tanpa keterikatan</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleExportJson} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Download Backup Lengkap (.JSON)
          </Button>
          <Button onClick={handleExportCsv} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Ekspor Transaksi ke Spreadsheet (.CSV)
          </Button>
        </CardContent>
      </Card>

      {/* Modal Set PIN */}
      <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Kunci PIN Aplikasi</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-center">
            <p className="text-xs text-muted-foreground">
              Masukkan 4 digit PIN baru untuk membuka aplikasi:
            </p>
            <Input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ""))}
              className="text-center text-2xl font-mono tracking-widest"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPinDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSavePin} disabled={newPin.length !== 4}>
              Simpan PIN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
