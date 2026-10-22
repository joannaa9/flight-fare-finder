// Flight API (AWS API Gateway → Lambda → DynamoDB). Subscriptions live in DynamoDB, never in Supabase.
const API_URL =
  (import.meta.env["VITE_FLIGHT_API_URL"] as string | undefined) ??
  "https://mzs84e84hg.execute-api.us-east-1.amazonaws.com";

export type PlanName = "tokyo" | "seoul" | "london";

// Rows from M1 have no status yet; treat them like an unpaid subscription.
export type SubscriptionStatus = "pending_payment" | "active" | "cancelled" | "expired";

export type Subscription = {
  email: string;
  route: string;
  plan_name: PlanName;
  target_price: number;
  currency: "TWD";
  created_at: string;
  updated_at: string;
  subscription_status?: SubscriptionStatus;
  current_period_end_date?: string;
};

export const statusOf = (s: Subscription): SubscriptionStatus =>
  s.subscription_status ?? "pending_payment";

async function readJson(res: Response) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
  return body;
}

export async function listSubscriptions(email: string): Promise<Subscription[]> {
  const res = await fetch(`${API_URL}/subscriptions?email=${encodeURIComponent(email)}`);
  return (await readJson(res)).subscriptions;
}

/**
 * Subscribe or update the target price.
 * Unpaid → the API returns an auto-submit HTML form, and this hands the page to ECPay's cashier.
 * Already paid (active / cancelled but still paid through) → JSON, updated in place.
 */
export async function subscribe(
  email: string,
  planName: PlanName,
  targetPrice: number,
): Promise<"checkout" | "updated"> {
  const res = await fetch(`${API_URL}/subscribe`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, plan_name: planName, target_price: targetPrice }),
  });
  if (res.ok && res.headers.get("content-type")?.startsWith("text/html")) {
    const html = await res.text();
    document.open();
    document.write(html); // its inline script POSTs the form to ECPay
    document.close();
    return "checkout";
  }
  await readJson(res);
  return "updated";
}

export async function cancelSubscription(
  email: string,
  route: string,
): Promise<{ current_period_end_date?: string }> {
  const res = await fetch(`${API_URL}/cancel`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, route }),
  });
  return readJson(res);
}
