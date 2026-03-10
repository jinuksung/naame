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
    <article className="nf-card nf-share-premium-card">
      <p className="nf-share-premium-name">{displayName}</p>
      <p className="nf-share-premium-hanja">
        {hanjaPair[0]}({readingPair[0]}) · {hanjaPair[1]}({readingPair[1]})
      </p>
      <p className="nf-share-premium-summary">{report.summary}</p>
      <ul className="nf-share-premium-bullets">
        {report.bullets.slice(0, 4).map((line, index) => (
          <li key={`${line}-${index}`}>{line}</li>
        ))}
      </ul>
      <div className="nf-share-premium-agebands">
        {report.ageBands.map((band) => (
          <section key={band.key} className="nf-share-premium-ageband-card">
            <h4>{band.label}</h4>
            <p>{band.lines[0]}</p>
            <p>{band.lines[1]}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
