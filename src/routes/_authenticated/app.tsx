import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { btnGhost, Logo } from "@/components/ui-kit";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({
    meta: [
      { title: "Dashboard — Flight Price Notifier" },
      { name: "description", content: "Your Flight Price Notifier dashboard." },
      { property: "og:title", content: "Dashboard — Flight Price Notifier" },
      { property: "og:description", content: "Your Flight Price Notifier dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AppHome,
});

function AppHome() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const { queryClient } = Route.useRouteContext();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/signin", replace: true });
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
