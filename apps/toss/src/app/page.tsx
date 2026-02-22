import { redirect } from "next/navigation";
import { TdsBottomCtaDouble, TdsLinkButton, TdsScreen } from "@/components/tds";

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
    <TdsScreen title="이름 추천 모드를 선택해 주세요">
      <section className="tds-landing">
        <p className="tds-description">
          임시 무료 기간에는 프리미엄 추천을 제한 없이 이용할 수 있습니다.
        </p>

        <TdsBottomCtaDouble
          topAccessory={<p className="tds-landing-caption">추천 모드는 언제든 전환할 수 있습니다.</p>}
          left={
            <TdsLinkButton href="/free" variant="secondary">
              무료 모드
            </TdsLinkButton>
          }
          right={<TdsLinkButton href="/premium">프리미엄 시작</TdsLinkButton>}
        />
      </section>
    </TdsScreen>
  );
}
