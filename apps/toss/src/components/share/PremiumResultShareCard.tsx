import { PremiumNameReport } from "@/types/recommend";

interface PremiumResultShareCardProps {
  displayName: string;
  hanjaPair: [string, string];
  readingPair: [string, string];
  report: PremiumNameReport;
}

export function PremiumResultShareCard({
  displayName,
  hanjaPair,
  readingPair,
  report,
}: PremiumResultShareCardProps): JSX.Element {
  return (
    <article className="tds-card share-premium-card">
      <p className="share-premium-name">{displayName}</p>
      <p className="share-premium-hanja">
        {hanjaPair[0]}({readingPair[0]}) · {hanjaPair[1]}({readingPair[1]})
      </p>
      <p className="share-premium-summary">{report.summary}</p>
      <ul className="share-premium-bullets">
        {report.bullets.slice(0, 4).map((line, index) => (
          <li key={`${line}-${index}`}>{line}</li>
        ))}
      </ul>
      <div className="share-premium-agebands">
        {report.ageBands.map((band) => (
          <section key={band.key} className="share-premium-ageband-card">
            <h4>{band.label}</h4>
            <p>{band.lines[0]}</p>
            <p>{band.lines[1]}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
