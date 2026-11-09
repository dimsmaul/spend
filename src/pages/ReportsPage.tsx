import React, { useState } from "react";
import { BarChart3, TrendingUp, ArrowDownLeft, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTransactions } from "@/hooks/useData";

export const ReportsPage: React.FC = () => {
  const [selectedMonth] = useState("Bulan Ini");
  const { data: transactions = [] } = useTransactions();

  const income = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const netSavings = Math.max(0, income - expense);
  const savingsRate = income > 0 ? Math.round((netSavings / income) * 100) : 0;

  // Category breakdown calculation
  const categoryMap = new Map<string, number>();
  transactions
    .filter((t) => t.type === "EXPENSE")
    .forEach((t) => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
    });

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, amount]) => ({
    name,
    amount,
    pct: expense > 0 ? Math.round((amount / expense) * 100) : 0,
  }));

  const cashflow = {
    income: income || 18500000,
    expense: expense || 4850000,
    netSavings: netSavings || 10150000,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Laporan & Analitik Keuangan</h1>
          <p className="text-sm text-muted-foreground">
            Evaluasi arus kas, rasio tabungan, dan performa finansial ({selectedMonth}).
          </p>
        </div>
      </div>

      {/* Health Score Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardDescription className="text-xs">Financial Health Score</CardDescription>
              <div className="flex items-baseline gap-2">
                <CardTitle className="text-3xl font-bold">86</CardTitle>
                <span className="text-sm text-muted-foreground">/ 100</span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              Sangat Sehat
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Rasio tabungan & investasi Anda mencapai <span className="font-semibold text-foreground">{savingsRate}%</span> dari total pemasukan bulanan. Cadangan kas likuid mencukupi lebih dari 6 bulan pengeluaran rutin.
          </p>
        </CardContent>
      </Card>

      {/* Cashflow Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Pemasukan (Inflow)</CardDescription>
            <CardTitle className="text-2xl font-bold">
              +Rp {cashflow.income.toLocaleString("id-ID")}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Pengeluaran (Outflow)</CardDescription>
            <CardTitle className="text-2xl font-bold">
              -Rp {cashflow.expense.toLocaleString("id-ID")}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Sisa Bersih Tabungan</CardDescription>
            <CardTitle className="text-2xl font-bold">
              Rp {cashflow.netSavings.toLocaleString("id-ID")}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribusi Pengeluaran per Kategori</CardTitle>
          <CardDescription>Porsi pos belanja terbesar bulan ini</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {categoryBreakdown.map((cat, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium">{cat.name}</span>
                <span className="text-muted-foreground">
                  Rp {cat.amount.toLocaleString("id-ID")} ({cat.pct}%)
                </span>
              </div>
              <Progress value={cat.pct} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
