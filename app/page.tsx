"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Card from "@/app/components/ui/Card";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const routeByRole = (role: string) => {
    if (role === "distributor") {
      router.replace("/distributor");
      return true;
    }
    if (role === "salesman") {
      router.replace("/salesman");
      return true;
    }
    return false;
  };

  // If already signed in, send the user straight to their dashboard.
  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || !active) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (active && profile) routeByRole(profile.role);
    };

    checkSession();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async () => {
    if (loading) return;

    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(true); // reset state back, wait actually keep it false so they can retry
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      setMessage(profileError.message);
      setLoading(false);
      return;
    }

    if (!routeByRole(profile.role)) {
      setMessage(`Welcome ${profile.full_name}! Your role is ${profile.role}.`);
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50/40 via-background to-indigo-100/20 dark:from-slate-950 dark:via-background dark:to-indigo-950/15 p-6">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-600/5"></div>
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-700/5"></div>

      <Card className="w-full max-w-md p-8 border-border bg-card/75 backdrop-blur-md shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-card-foreground tracking-tight">
            Distribution DMS
          </h1>
          <p className="mt-2 text-sm text-muted">
            Log in to manage orders, stock, and routing
          </p>
        </div>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            signIn();
          }}
        >
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted">Email Address</label>
            <Input
              type="email"
              placeholder="name@company.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            variant="primary"
            className="w-full py-2.5 mt-2 shadow-md"
            type="submit"
            disabled={loading || !email || !password}
          >
            {loading ? "Signing in…" : "Sign In"}
          </Button>

          {message && (
            <div className="mt-4 rounded-lg border border-red-200/50 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20 p-3.5 text-center text-sm font-medium text-red-600 dark:text-red-400">
              {message}
            </div>
          )}
        </form>
      </Card>
    </main>
  );
}