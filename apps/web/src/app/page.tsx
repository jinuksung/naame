import Link from "next/link";
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

  return (
    <main className="nf-shell">
      <section className="nf-panel nf-landing">
        <h1 className="nf-title">이름 추천 모드를 선택해 주세요</h1>
        <p className="nf-description">
          임시 무료 기간에는 프리미엄 추천을 제한 없이 이용할 수 있습니다.
        </p>

        <div className="nf-landing-actions">
          <Link className="nf-button nf-button-primary" href="/premium">
            프리미엄 시작
          </Link>
          <Link className="nf-button nf-button-secondary" href="/free">
            무료 모드로 이동
          </Link>
        </div>
      </section>
    </main>
  );
}
