import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PiggyBank,
  TrendingUp,
  Receipt,
  Inbox,
  Wallet,
  Handshake,
  Target,
  Repeat,
  BarChart3,
  Bot,
  User,
  Menu,
  X,
  Plus,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Budget", path: "/budget", icon: PiggyBank },
    { label: "Transaksi", path: "/transactions", icon: Receipt },
    { label: "Inbox", path: "/inbox", icon: Inbox },
    { label: "Investasi", path: "/investments", icon: TrendingUp },
    { label: "Dompet", path: "/wallets", icon: Wallet },
    { label: "Utang", path: "/debts", icon: Handshake },
    { label: "Goals", path: "/goals", icon: Target },
    { label: "Rutin", path: "/recurring", icon: Repeat },
    { label: "Laporan", path: "/reports", icon: BarChart3 },
    { label: "Advisor", path: "/advisor", icon: Bot },
    { label: "Profil", path: "/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Standard Shadcn Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-base">
              <span>Spend</span>
            </Link>

            <nav className="hidden 2xl:flex items-center gap-1 text-sm">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/transactions?action=add">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Tambah Transaksi</span>
              </Button>
            </Link>

            {user ? (
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.email?.split("@")[0]}</span>
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <LogIn className="h-4 w-4" />
                  <span>Masuk</span>
                </Button>
              </Link>
            )}

            <Button
              variant="outline"
              size="icon"
              className="2xl:hidden h-8 w-8"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="2xl:hidden border-b bg-background px-4 py-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="container mx-auto flex-1 px-4 sm:px-8 py-6 pb-20 2xl:pb-6 space-y-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar (Standard Shadcn tokens) */}
      <nav className="2xl:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur px-2 py-2">
        <div className="flex items-center justify-around">
          {[
            { label: "Dashboard", path: "/", icon: LayoutDashboard },
            { label: "Budget", path: "/budget", icon: PiggyBank },
            { label: "Transaksi", path: "/transactions", icon: Receipt },
            { label: "Inbox", path: "/inbox", icon: Inbox },
            { label: "Investasi", path: "/investments", icon: TrendingUp },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-md text-[10px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
