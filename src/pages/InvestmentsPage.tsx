import React, { useState } from "react";
import { TrendingUp, Plus } from "lucide-react";
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
import { useHoldings, useCreateHolding, useDeleteHolding } from "@/hooks/useData";
import type { InvestmentHolding, InvestmentType } from "@/types";

export const InvestmentsPage: React.FC = () => {
  const { data: holdings = [], isLoading } = useHoldings();
  const createHoldingMutation = useCreateHolding();
  const deleteHoldingMutation = useDeleteHolding();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<InvestmentType>("STOCK");
  const [units, setUnits] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [curPrice, setCurPrice] = useState("");

  const totalCost = holdings.reduce((sum, h) => sum + h.units * h.avg_buy_price, 0);
  const totalValue = holdings.reduce((sum, h) => sum + h.units * h.current_price, 0);
  const totalProfit = totalValue - totalCost;
  const profitPct = totalCost > 0 ? ((totalProfit / totalCost) * 100).toFixed(2) : "0.00";

  const handleAddHolding = async () => {
    if (!symbol || !units || !buyPrice) return;
    await createHoldingMutation.mutateAsync({
      symbol: symbol.toUpperCase(),
      name: name || symbol.toUpperCase(),
      type,
      units: parseFloat(units),
      avg_buy_price: parseFloat(buyPrice),
      current_price: parseFloat(curPrice || buyPrice),
      currency: "IDR",
    });
    setSymbol("");
    setName("");
    setUnits("");
    setBuyPrice("");
    setCurPrice("");
    setIsDialogOpen(false);
  };

  const getTypeLabel = (t: InvestmentType) => {
    switch (t) {
      case "STOCK":
        return "Saham";
      case "CRYPTO":
        return "Crypto";
      case "GOLD":
        return "Emas";
      case "MUTUAL_FUND":
        return "Reksadana";
      case "DEPOSITO":
        return "Deposito";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portofolio Investasi</h1>
          <p className="text-sm text-muted-foreground">
            Pantau akumulasi aset dan performa modal Anda.
          </p>
        </div>

        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Catat Aset Baru
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Nilai Portofolio Sekarang</CardDescription>
            <CardTitle className="text-2xl font-bold">
              Rp {Math.round(totalValue).toLocaleString("id-ID")}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Modal Beli</CardDescription>
            <CardTitle className="text-2xl font-bold">
              Rp {Math.round(totalCost).toLocaleString("id-ID")}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Unrealized P&L</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {totalProfit >= 0 ? "+" : ""}Rp {Math.round(totalProfit).toLocaleString("id-ID")} ({profitPct}%)
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Holdings Table Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar Kepemilikan Aset</CardTitle>
          <CardDescription>Instrumen aktif yang Anda pantau</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {holdings.map((item) => {
            const cost = item.units * item.avg_buy_price;
            const value = item.units * item.current_price;
            const profit = value - cost;
            const pct = cost > 0 ? ((profit / cost) * 100).toFixed(1) : "0";

            return (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 last:border-0 last:pb-0 gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted font-bold text-sm">
                    {item.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{item.symbol}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {getTypeLabel(item.type)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.name}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 text-right">
                  <div className="text-xs text-muted-foreground">
                    <span>{item.units} unit</span>
                    <span className="block">@Rp {item.current_price.toLocaleString("id-ID")}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold">Rp {Math.round(value).toLocaleString("id-ID")}</div>
                    <div className="text-xs text-muted-foreground">
                      {profit >= 0 ? "+" : ""}Rp {Math.round(profit).toLocaleString("id-ID")} ({pct}%)
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Modal Add Holding */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Aset Investasi</DialogTitle>
          </DialogHeader>
          <div className="space-y-3.5 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Simbol / Kode</label>
                <Input
                  placeholder="Contoh: BBRI, BTC"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Jenis Aset</label>
                <Select value={type} onValueChange={(val) => val && setType(val as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STOCK">Saham (IDX)</SelectItem>
                    <SelectItem value="CRYPTO">Kripto</SelectItem>
                    <SelectItem value="GOLD">Emas</SelectItem>
                    <SelectItem value="MUTUAL_FUND">Reksadana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nama Lengkap Aset (Opsional)</label>
              <Input
                placeholder="Misal: Bank Rakyat Indonesia"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Jumlah Unit</label>
                <Input
                  type="number"
                  placeholder="100"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Harga Beli</label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Harga Saat Ini</label>
                <Input
                  type="number"
                  placeholder="5500"
                  value={curPrice}
                  onChange={(e) => setCurPrice(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddHolding}>
              Simpan ke Portofolio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
