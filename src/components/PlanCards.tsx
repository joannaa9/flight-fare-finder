import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing, Check, CreditCard, Loader2 } from "lucide-react";
import { btnGhost, btnPrimary } from "@/components/ui-kit";
import {
  cancelSubscription,
  listSubscriptions,
  statusOf,
  subscribe,
  type PlanName,
  type Subscription,
  type SubscriptionStatus,
} from "@/lib/flight-api";

const PLANS: { name: PlanName; route: string; title: string; subtitle: string; hint: number }[] = [
  { name: "tokyo", route: "TPE-TYO", title: "台北 ✈ 東京", subtitle: "Taipei → Tokyo", hint: 7800 },
  { name: "seoul", route: "TPE-SEL", title: "台北 ✈ 首爾", subtitle: "Taipei → Seoul", hint: 6800 },
  { name: "london", route: "TPE-LON", title: "台北 ✈ 倫敦", subtitle: "Taipei → London", hint: 28000 },
];

const twd = (n: number) => `NT$${n.toLocaleString("en-US")}`;

// Paid rows (active, or cancelled but still inside the paid period) update in place;
// everything else goes through the ECPay cashier.
const isPaid = (status: SubscriptionStatus | undefined) =>
  status === "active" || status === "cancelled";

const BADGE: Record<SubscriptionStatus, { label: string; className: string }> = {
  active: { label: "已訂閱 · Active", className: "border border-primary/40 bg-primary/10 text-primary-glow" },
  pending_payment: { label: "未完成付款 · Unpaid", className: "border border-amber-400/30 bg-amber-500/10 text-amber-300" },
  cancelled: { label: "已取消 · Cancelled", className: "bg-muted text-muted-foreground" },
  expired: { label: "已結束 · Ended", className: "bg-muted text-muted-foreground" },
};

export function PlanCards({ email }: { email: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["subscriptions", email],
    queryFn: () => listSubscriptions(email),
  });

  return (
    <section className="mt-8">
      <h2 className="text-xl font-medium tracking-tight">選擇要追蹤的航線 · Pick a route</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        每 30 分鐘檢查一次下個月的最低票價，低於你的目標價就寄 email
        給你。月訂閱制，以綠界信用卡定期定額付款，可隨時取消。
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
  // Inline confirm: in-app browsers (LINE, Facebook, embedded webviews) make
  // window.confirm() return false without showing anything.
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const status = subscription && statusOf(subscription);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["subscriptions", email] });

  const mutation = useMutation({
    mutationFn: (target: number) => subscribe(email, plan.name, target),
    onSuccess: (result) => {
      if (result === "checkout") return; // the page is now on its way to ECPay
      setEditing(false);
      setPrice("");
      return refresh();
    },
  });
  const cancel = useMutation({
    mutationFn: () => cancelSubscription(email, plan.route),
    onSuccess: () => {
      setConfirmingCancel(false);
      return refresh();
    },
  });

  const target = Number(price);
  const valid = price !== "" && Number.isFinite(target) && target > 0;
  const showForm = !subscription || status === "expired" || editing;
  const until = subscription?.current_period_end_date;

  return (
    <div className="panel rounded-2xl border border-border p-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-medium">{plan.title}</h3>
          <p className="eyebrow mt-1 text-muted-foreground">{plan.subtitle}</p>
        </div>
        {status && (
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-sm px-2.5 py-1 text-xs font-medium ${BADGE[status].className}`}
          >
            {status === "active" && <Check className="h-3 w-3" />}
            {BADGE[status].label}
          </span>
        )}
      </div>

      {loading ? (
        <Loader2 className="mt-6 h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <>
          {subscription && status !== "expired" && (
            <p className="mt-4 text-sm">
              目標價 Target：<span className="font-semibold">{twd(subscription.target_price)}</span>
            </p>
          )}
          {status === "active" && until && (
            <p className="mt-1 text-xs text-muted-foreground">本期有效至 {until}，到期自動續訂</p>
          )}
          {status === "cancelled" && until && (
            <p className="mt-1 text-xs text-muted-foreground">
              有效至 {until}（這天之前仍會寄降價通知）
            </p>
          )}
          {status === "pending_payment" && (
            <p className="mt-1 text-xs text-muted-foreground">完成付款後才會開始寄送降價通知。</p>
          )}
          {status === "expired" && (
            <p className="mt-4 text-sm text-muted-foreground">
              訂閱已結束，重新訂閱即可再收到通知。
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
                  className="mt-1 w-full rounded-sm border border-input bg-background/70 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/40"
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
                  ) : isPaid(status) ? (
                    <BellRing className="h-4 w-4" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  {isPaid(status)
                    ? "儲存目標價"
                    : status === "expired"
                      ? "重新訂閱並付款"
                      : "訂閱並付款 · Subscribe"}
                </button>
                {editing && (
                  <button type="button" onClick={() => setEditing(false)} className={btnGhost}>
                    取消
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {status === "pending_payment" && subscription && (
                <button
                  onClick={() => mutation.mutate(subscription.target_price)}
                  disabled={mutation.isPending}
                  className={btnPrimary}
                >
                  {mutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  完成付款 · Pay
                </button>
              )}
              <button onClick={() => setEditing(true)} className={btnGhost}>
                更新目標價 · Update
              </button>
              {status === "active" && !confirmingCancel && (
                <button
                  onClick={() => setConfirmingCancel(true)}
                  className={btnGhost.replace("text-foreground", "text-destructive")}
                >
                  取消訂閱
                </button>
              )}
              {status === "active" && confirmingCancel && (
                <div className="w-full rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm">
                  <p>
                    確定要取消 {plan.title} 的訂閱嗎？之後不會再扣款，已付費的這一期
                    {until ? `（至 ${until}）` : ""}仍會繼續通知。
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => cancel.mutate()}
                      disabled={cancel.isPending}
                      className={btnGhost.replace("text-foreground", "text-destructive")}
                    >
                      {cancel.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      確定取消
                    </button>
                    <button
                      onClick={() => setConfirmingCancel(false)}
                      disabled={cancel.isPending}
                      className={btnGhost}
                    >
                      返回
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {(mutation.error || cancel.error) && (
            <p className="mt-2 text-sm text-destructive">
              {((mutation.error ?? cancel.error) as Error).message}
            </p>
          )}
        </>
      )}
    </div>
  );
}
