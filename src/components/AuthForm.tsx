import { Link, useNavigate } from "react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { btnPrimary, Logo } from "@/components/ui-kit";

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isUp = mode === "signup";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error } = isUp
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/app" } })
      : await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    if (!data.session) return setError("請到信箱確認帳號 · Check your email to confirm.");
    navigate("/app", { replace: true });
  }

  const input = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

  return (
    <div className="grid min-h-screen place-items-center bg-hero px-6">
      <div className="animate-fade-up w-full max-w-sm">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card/80 p-7">
          <h1 className="text-xl font-semibold">{isUp ? "建立帳號 · Sign up" : "登入 · Sign in"}</h1>
          <input className={input} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <input className={input} type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={isUp ? "new-password" : "current-password"} />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={loading} className={`${btnPrimary} w-full py-2.5`}>
            {loading ? "…" : isUp ? "Sign up / 註冊" : "Sign in / 登入"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            {isUp ? "已經有帳號？ " : "還沒有帳號？ "}
            <Link to={isUp ? "/signin" : "/signup"} className="text-primary-glow hover:underline">
              {isUp ? "Sign in" : "Sign up"}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
