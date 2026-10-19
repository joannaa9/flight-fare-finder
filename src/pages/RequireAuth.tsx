import { Outlet, redirect, useRouteLoaderData } from "react-router";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export async function requireAuthLoader() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw redirect("/signin");
  return { user: data.user };
}

export function useAuthUser(): User {
  return (useRouteLoaderData("authenticated") as { user: User }).user;
}

export function RequireAuth() {
  return <Outlet />;
}
