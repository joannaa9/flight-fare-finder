import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing, Check, Loader2 } from "lucide-react";
import { btnGhost, btnPrimary } from "@/components/ui-kit";
import { listSubscriptions, subscribe, type PlanName, type Subscription } from "@/lib/flight-api";

const PLANS: { name: PlanName; route: string; title: string; subtitle: string; hint: number }[] = [
  { name: "tokyo", route: "TPE-TYO", title: "台北 ✈ 東京", subtitle: "Taipei → Tokyo", hint: 7800 },
  { name: "seoul", route: "TPE-SEL", title: "台北 ✈ 首爾", subtitle: "Taipei → Seoul", hint: 6800 },
];

const twd = (n: number) => `NT$${n.toLocaleString("en-US")}`;

export function PlanCards({ email }: { email: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["subscriptions", email],
    queryFn: () => listSubscriptions(email),
  });

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">選擇要追蹤的航線 · Pick a route</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        每 30 分鐘檢查一次下個月的最低票價，低於你的目標價就寄 email 給你。
      </p>
      {error && (
        <p className="mt-4 text-sm text-destructive">讀取訂閱失敗：{(error as Error).message}</p>
      )}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.name}
            plan={plan}
            email={email}
            loading={isLoading}
            subscription={data?.find((s) => s.route === plan.route)}
          />
        ))}
      </div>
    </section>
  );
}

function PlanCard({
  plan,
  email,
  loading,
  subscription,
}: {
  plan: (typeof PLANS)[number];
  email: string;
  loading: boolean;
  subscription: Subscription | undefined;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState("");
  const mutation = useMutation({
    mutationFn: (target: number) => subscribe(email, plan.name, target),
    onSuccess: () => {
      setEditing(false);
      setPrice("");
      return queryClient.invalidateQueries({ queryKey: ["subscriptions", email] });
    },
  });

  const target = Number(price);
  const valid = price !== "" && Number.isFinite(target) && target > 0;
  const showForm = !subscription || editing;

  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">{plan.title}</h3>
          <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
        </div>
        {subscription && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
            <Check className="h-3 w-3" /> 已訂閱 · Subscribed
          </span>
        )}
      </div>

      {loading ? (
        <Loader2 className="mt-6 h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <>
          {subscription && (
            <p className="mt-4 text-sm">
              目標價 Target：<span className="font-semibold">{twd(subscription.target_price)}</span>
            </p>
          )}
          {showForm ? (
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (valid) mutation.mutate(target);
              }}
            >
              <label className="block text-sm">
                目標價（新台幣）· Target price (TWD)
                <input
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={String(plan.hint)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </label>
              <p className="text-xs text-muted-foreground">參考：目前最低約 {twd(plan.hint)}</p>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!valid || mutation.isPending}
                  className={btnPrimary}
                >
                  {mutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BellRing className="h-4 w-4" />
                  )}
                  {subscription ? "儲存目標價" : "開始追蹤"}
                </button>
                {editing && (
                  <button type="button" onClick={() => setEditing(false)} className={btnGhost}>
                    取消
                  </button>
                )}
              </div>
              {mutation.error && (
                <p className="text-sm text-destructive">{(mutation.error as Error).message}</p>
              )}
            </form>
          ) : (
            <button onClick={() => setEditing(true)} className={`${btnGhost} mt-4`}>
              更新目標價 · Update
            </button>
          )}
        </>
      )}
    </div>
  );
}
