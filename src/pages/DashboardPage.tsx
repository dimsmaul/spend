import React from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  Camera,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useWallets, useHoldings, useDebts, useBudgets, useTransactions } from "@/hooks/useData";

export const DashboardPage: React.FC = () => {
  const { data: wallets = [] } = useWallets();
  const { data: holdings = [] } = useHoldings();
  const { data: debts = [] } = useDebts();
  const { data: budgets = [] } = useBudgets();
  const { data: transactions = [] } = useTransactions();

  const totalCash = wallets.reduce((sum, w) => sum + w.balance, 0);
  const totalInvestments = holdings.reduce((sum, h) => sum + h.units * h.current_price, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.units * h.avg_buy_price, 0);
  const investmentsProfit = totalInvestments - totalCost;
  const totalPayableDebts = debts
    .filter((d) => d.type === "PAYABLE" && d.status !== "PAID")
    .reduce((sum, d) => sum + d.remaining_amount, 0);

  const netWorth = totalCash + totalInvestments - totalPayableDebts;

  const targetBudget = budgets.reduce((acc, b) => acc + b.target_amount, 0) || 7500000;
  const spentBudget = budgets.reduce((acc, b) => acc + b.spent_amount, 0) || 0;
  const budgetPercentage = Math.round((spentBudget / targetBudget) * 100);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Overview Cards Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kekayaan Bersih</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {netWorth.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Kas likuid: Rp {totalCash.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Bulan Ini</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">
                Rp {spentBudget.toLocaleString("id-ID")}
              </div>
              <span className="text-xs text-muted-foreground">
                Plafon: Rp {targetBudget.toLocaleString("id-ID")}
              </span>
            </div>
            <Progress value={budgetPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Sisa: Rp {(targetBudget - spentBudget).toLocaleString("id-ID")}</span>
              <span>{budgetPercentage}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portofolio Investasi</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {totalInvestments.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Unrealized P&L: {investmentsProfit >= 0 ? "+" : "-"}Rp {Math.abs(investmentsProfit).toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action: Scan Struk */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Camera className="h-4 w-4 text-muted-foreground" /> Scan Struk Belanja
          </CardTitle>
          <CardDescription>
            Pindai foto struk fisik belanjaan Anda dengan AI untuk mencatat item transaksi otomatis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/transactions?action=scan">
            <Button variant="outline" size="sm" className="gap-2">
              <Camera className="h-4 w-4" /> Buka Kamera Struk
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Transactions List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Transaksi Terbaru</CardTitle>
            <CardDescription>Aktivitas arus kas terakhir Anda</CardDescription>
          </div>
          <Link to="/transactions">
            <Button variant="ghost" size="sm" className="text-xs">
              Lihat Semua <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentTransactions.map((tx) => (
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
                  <p className="text-sm font-medium leading-none">{tx.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                      {tx.category}
                    </Badge>
                    <span>{tx.wallet_name}</span>
                    <span>•</span>
                    <span>{tx.date}</span>
                  </div>
                </div>
              </div>
              <div className="text-right font-medium text-sm">
                {tx.type === "INCOME" ? "+" : "-"}Rp {tx.amount.toLocaleString("id-ID")}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
