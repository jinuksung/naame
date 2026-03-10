interface FreeResultShareCardProps {
  displayName: string;
  hanjaPair: [string, string];
  readingPair: [string, string];
  meaningPair: [string, string];
}

function displayMeaning(meaning: string): string {
  const normalized = meaning.trim();
  return normalized.length > 0 ? normalized : "의미 미상";
}

export function FreeResultShareCard({
  displayName,
  hanjaPair,
  readingPair,
  meaningPair,
}: FreeResultShareCardProps): JSX.Element {
  return (
    <article className="tds-card share-free-card">
      <p className="share-free-name">{displayName}</p>
      <ul className="hanja-detail-list">
        <li className="hanja-detail-item">
          <span className="hanja-char">{hanjaPair[0]}</span>
          <span className="hanja-reading">{readingPair[0]}</span>
          <span className="hanja-meaning">{displayMeaning(meaningPair[0])}</span>
        </li>
        <li className="hanja-detail-item">
          <span className="hanja-char">{hanjaPair[1]}</span>
          <span className="hanja-reading">{readingPair[1]}</span>
          <span className="hanja-meaning">{displayMeaning(meaningPair[1])}</span>
        </li>
      </ul>
    </article>
  );
}
