import { createFileRoute, Link } from "@tanstack/react-router";
import { BellRing, Radar, XCircle } from "lucide-react";
import { btnPrimary, Logo, Reveal } from "@/components/ui-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flight Price Notifier — 機票降價通知" },
      { name: "description", content: "設定航線與目標價，機票降價就通知你。Set a route and a target price — we email you when the fare drops." },
      { property: "og:title", content: "Flight Price Notifier — 機票降價通知" },
      { property: "og:description", content: "Set a route and a target price — we email you when the fare drops." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  { icon: Radar, title: "盯緊熱門航線", en: "Always-on route watching", body: "持續監控台北出發的熱門航線（東京、首爾），自動抓最低票價。" },
  { icon: BellRing, title: "達標自動通知", en: "Target-price email alerts", body: "低於你設定的目標價，就寄 email 提醒你，附上立即訂購連結。" },
  { icon: XCircle, title: "隨時取消", en: "Cancel anytime", body: "月訂閱制，不想用隨時停，沒有綁約。" },
];

function Index() {
  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <Link to="/signin" className={btnPrimary}>Sign in / 登入</Link>
      </header>

      <main>
        <section className="mx-auto max-w-4xl px-6 pb-24 pt-20 text-center sm:pt-28">
          <p className="animate-fade-up mb-6 inline-block rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            台北出發 · TPE → NRT / ICN
          </p>
          <h1 className="animate-fade-up text-5xl font-bold tracking-tight sm:text-7xl" style={{ animationDelay: "80ms" }}>
            <span className="text-gradient">Flight Price Notifier</span>
          </h1>
          <p className="animate-fade-up mt-6 text-xl font-medium sm:text-2xl" style={{ animationDelay: "160ms" }}>
            設定航線與目標價，機票降價就通知你
          </p>
          <p className="animate-fade-up mt-3 text-muted-foreground" style={{ animationDelay: "240ms" }}>
            Set a route and a target price — we email you when the fare drops.
          </p>
          <div className="animate-fade-up mt-10" style={{ animationDelay: "320ms" }}>
            <Link to="/signup" className={`${btnPrimary} px-6 py-3 text-base`}>免費開始 · Get started</Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-28 md:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.en} delay={i * 120}>
              <div className="h-full rounded-2xl border border-border bg-card/70 p-7 transition hover:border-primary/50">
                <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary-glow">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.en}</p>
                <p className="mt-4 text-sm leading-relaxed text-foreground/80">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 Flight Price Notifier
      </footer>
    </div>
  );
}
