import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { btnGhost, Logo } from "@/components/ui-kit";
import { usePageMeta } from "@/lib/use-page-meta";
import { useAuthUser } from "./RequireAuth";

export function AppHome() {
  usePageMeta("Dashboard — Flight Price Notifier", "Your Flight Price Notifier dashboard.");
  const user = useAuthUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate("/signin", { replace: true });
  }

  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <button onClick={signOut} className={btnGhost}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out / 登出
        </button>
      </header>
      <main className="mx-auto max-w-3xl px-6 pt-20">
        <div className="animate-fade-up rounded-2xl border border-border bg-card/70 p-10">
          <h1 className="text-3xl font-bold tracking-tight">Hi {user.email}</h1>
          <p className="mt-4 text-lg">你的航線追蹤儀表板即將上線 — 下一個里程碑會加上訂閱航線的功能。</p>
          <p className="mt-2 text-muted-foreground">Your dashboard is coming soon. Route-subscription will be added in the next milestone.</p>
        </div>
      </main>
    </div>
  );
}
