import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { btnGhost, Logo } from "@/components/ui-kit";
import { PlanCards } from "@/components/PlanCards";
import { usePageMeta } from "@/lib/use-page-meta";
import { useAuthUser } from "./RequireAuth";

export function AppHome() {
  usePageMeta("Dashboard — Flight Price Notifier", "Your Flight Price Notifier dashboard.");
  const user = useAuthUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Set by the ECPay OrderResultURL redirect. The page only reports it; the server-side
  // ReturnURL callback is what activates the subscription, possibly a moment later.
  const [params] = useSearchParams();
  const purchase = params.get("purchase");

  useEffect(() => {
    if (purchase !== "success") return;
    const timers = [2000, 6000].map((ms) =>
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ["subscriptions"] }), ms),
    );
    return () => timers.forEach(clearTimeout);
  }, [purchase, queryClient]);

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
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-12">
        <div className="animate-fade-up">
          <h1 className="text-3xl font-bold tracking-tight">Hi {user.email}</h1>
          {purchase === "success" && (
            <p className="mt-4 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm">
              付款完成，感謝訂閱！訂閱狀態會在幾秒內更新為「已訂閱」，歡迎信也會寄到你的信箱。
            </p>
          )}
          {purchase === "failed" && (
            <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
              付款沒有成功，沒有扣款。可以按「完成付款」再試一次。
            </p>
          )}
          {user.email && <PlanCards email={user.email} />}
        </div>
      </main>
    </div>
  );
}
