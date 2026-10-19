import { AuthForm } from "@/components/AuthForm";
import { usePageMeta } from "@/lib/use-page-meta";

export function SignUp() {
  usePageMeta("Sign up — Flight Price Notifier", "Create your Flight Price Notifier account.");
  return <AuthForm mode="signup" />;
}
