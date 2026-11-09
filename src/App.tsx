import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { BudgetPage } from "@/pages/BudgetPage";
import { InvestmentsPage } from "@/pages/InvestmentsPage";
import { TransactionsPage } from "@/pages/TransactionsPage";
import { InboxPage } from "@/pages/InboxPage";
import { WalletsPage } from "@/pages/WalletsPage";
import { DebtsPage } from "@/pages/DebtsPage";
import { GoalsPage } from "@/pages/GoalsPage";
import { RecurringPage } from "@/pages/RecurringPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { AdvisorPage } from "@/pages/AdvisorPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { AuthPage } from "@/pages/AuthPage";
import { AuthProvider } from "@/context/AuthContext";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/budget" element={<BudgetPage />} />
              <Route path="/investments" element={<InvestmentsPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/wallets" element={<WalletsPage />} />
              <Route path="/debts" element={<DebtsPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/recurring" element={<RecurringPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/advisor" element={<AdvisorPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
