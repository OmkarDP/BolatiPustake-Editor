// src/pages/Login.tsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login, isAuthed } from "@/auth";

// shadcn/ui components (adjust imports if your paths differ)
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Eye, EyeOff, LogIn } from "lucide-react";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();

  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already authed, bounce to home
  useEffect(() => {
    if (isAuthed()) {
      const to = (loc.state as any)?.from?.pathname || "/";
      nav(to, { replace: true });
    }
  }, [nav, loc.state]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const ok = login(id.trim(), pw);
    setLoading(false);
    if (ok) {
      const to = (loc.state as any)?.from?.pathname || "/";
      nav(to, { replace: true });
    } else {
      setErr("Invalid ID or Password");
    }
  }

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-black">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4">
        {/* Logo + Title */}
        <div className="mb-6 flex flex-col items-center">
          <img
            src="/logo.png"
            alt="Bolati Pustake"
            className="h-14 w-14 rounded-xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800"
          />
          <h1 className="mt-3 text-xl font-semibold tracking-tight">
            Bolati Pustake — Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Simple login for our private uploader
          </p>
        </div>

        <Card className="w-full border-slate-200/70 shadow-lg shadow-slate-200/30 dark:border-slate-800/60 dark:shadow-black/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sign in</CardTitle>
            <CardDescription>
              Enter your admin ID and password to continue.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={onSubmit}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="admin-id">Admin ID</Label>
                <Input
                  id="admin-id"
                  placeholder="e.g. mom"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  autoFocus
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    aria-label={showPw ? "Hide password" : "Show password"}
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute inset-y-0 right-2 flex items-center rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {err ? (
                <p className="text-sm font-medium text-red-600">{err}</p>
              ) : null}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !id || !pw}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {loading ? "Signing in..." : "Login"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col items-start gap-1 text-xs text-muted-foreground">
            <p>
              Tip: This page is private. If you reach here by mistake, please
              close the tab.
            </p>
          </CardFooter>
        </Card>

        <footer className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Bolati Pustake • Internal tool
        </footer>
      </div>
    </div>
  );
}
