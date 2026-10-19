import { AuthForm } from "@/components/AuthForm";
import { usePageMeta } from "@/lib/use-page-meta";

export function SignIn() {
  usePageMeta("Sign in — Flight Price Notifier", "Sign in to Flight Price Notifier.");
  return <AuthForm mode="signin" />;
}
