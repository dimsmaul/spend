import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, Mail, User, Loader2, ArrowRight, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message || "Gagal masuk. Periksa email dan password Anda.");
    } else {
      navigate("/");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (password.length < 6) {
      setErrorMsg("Password minimal harus 6 karakter.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await signUp(email, password, name);
    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message || "Gagal mendaftar akun baru.");
    } else {
      setSuccessMsg("Pendaftaran berhasil! Silakan periksa email untuk konfirmasi atau coba login.");
      setActiveTab("login");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="text-center space-y-1.5 pb-4">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border bg-muted mb-2">
            <Wallet className="h-5 w-5 text-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Spend</CardTitle>
          <CardDescription className="text-xs">
            Aplikasi pencatatan keuangan pribadi, target budget, dan investasi.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={(val) => {
            setActiveTab(val as "login" | "register");
            setErrorMsg(null);
            setSuccessMsg(null);
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Masuk</TabsTrigger>
              <TabsTrigger value="register">Daftar Akun</TabsTrigger>
            </TabsList>

            {errorMsg && (
              <div className="mt-3 p-3 text-xs rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mt-3 p-3 text-xs rounded-md bg-secondary text-secondary-foreground border">
                {successMsg}
              </div>
            )}

            {/* TAB LOGIN */}
            <TabsContent value="login" className="space-y-3 pt-3">
              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </label>
                  <Input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full gap-2 mt-2" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Masuk ke Akun
                </Button>
              </form>
            </TabsContent>

            {/* TAB REGISTER */}
            <TabsContent value="register" className="space-y-3 pt-3">
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Nama Lengkap
                  </label>
                  <Input
                    placeholder="Contoh: Dimas Maulana"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </label>
                  <Input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full gap-2 mt-2" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Buat Akun Baru
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
