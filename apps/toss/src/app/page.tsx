import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function toBoolean(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function resolveKstDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function shouldRedirectToPremium(): boolean {
  const isDefaultRoute = toBoolean(process.env.FEATURE_PREMIUM_DEFAULT_ROUTE);
  if (!isDefaultRoute) {
    return false;
  }

  const freeUntil = (process.env.FEATURE_PREMIUM_FREE_UNTIL ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(freeUntil)) {
    return false;
  }

  const todayKst = resolveKstDate();
  return todayKst <= freeUntil;
}

export default function HomePage(): JSX.Element {
  if (shouldRedirectToPremium()) {
    redirect("/premium");
  }

  redirect("/free");
}
