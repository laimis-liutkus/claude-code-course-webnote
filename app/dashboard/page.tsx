import type { JSX } from "react";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage(): Promise<JSX.Element> {
  const user = await requireUser();

  return <div>Dashboard for {user.name} (placeholder)</div>;
}
