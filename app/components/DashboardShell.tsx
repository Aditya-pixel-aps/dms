"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Sidebar, { navByRole } from "@/app/components/Sidebar";

type Role = "distributor" | "salesman";

type Profile = {
  full_name: string;
  role: Role;
};

export default function DashboardShell({
  requiredRole,
  title,
  children,
  headerAction,
}: {
  requiredRole: Role;
  title: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}) {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    let active = true;

    const verify = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", session.user.id)
        .single();

      if (!active) return;

      if (error || !data) {
        router.replace("/");
        return;
      }

      if (data.role !== requiredRole) {
        router.replace(`/${data.role}`);
        return;
      }

      setProfile(data as Profile);
      setStatus("ready");
    };

    verify();

    return () => {
      active = false;
    };
  }, [requiredRole, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (status === "loading" || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/85 backdrop-blur-md px-6 py-4.5">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-card-foreground">{title}</h1>
          <p className="mt-0.5 text-2xs font-bold uppercase tracking-wider text-muted">{profile.role}</p>
        </div>

        <div className="flex items-center gap-4.5">
          {headerAction}
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-card-foreground">{profile.full_name}</span>
          </div>
          <button
            className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-card-foreground shadow-2xs hover:bg-secondary-hover transition-all duration-200 active:scale-95"
            onClick={signOut}
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <Sidebar items={navByRole[profile.role]} />
        <main className="flex-1 p-6 md:p-8 bg-background/60">{children}</main>
      </div>
    </div>
  );
}
