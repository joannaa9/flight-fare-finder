// Flight API (AWS API Gateway → Lambda → DynamoDB). Subscriptions live in DynamoDB, never in Supabase.
const API_URL =
  (import.meta.env["VITE_FLIGHT_API_URL"] as string | undefined) ??
  "https://mzs84e84hg.execute-api.us-east-1.amazonaws.com";

export type PlanName = "tokyo" | "seoul";

export type Subscription = {
  email: string;
  route: string;
  plan_name: PlanName;
  target_price: number;
  currency: "TWD";
  created_at: string;
  updated_at: string;
};

async function readJson(res: Response) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
  return body;
}

export async function listSubscriptions(email: string): Promise<Subscription[]> {
  const res = await fetch(`${API_URL}/subscriptions?email=${encodeURIComponent(email)}`);
  return (await readJson(res)).subscriptions;
}

export async function subscribe(
  email: string,
  planName: PlanName,
  targetPrice: number,
): Promise<void> {
  const res = await fetch(`${API_URL}/subscribe`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, plan_name: planName, target_price: targetPrice }),
  });
  await readJson(res);
}
