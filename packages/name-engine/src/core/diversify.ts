export interface StartEndDiversifyOptions<TCandidate> {
  limit: number;
  maxSameStart: number;
  maxSameEnd: number;
  getName?: (candidate: TCandidate) => string;
}

export interface SeededWindowOptions {
  limit: number;
  seed?: number;
}

function resolveName<TCandidate>(
  candidate: TCandidate,
  getName?: (candidate: TCandidate) => string
): string {
  if (getName) {
    return getName(candidate);
  }

  const maybeName = (candidate as { name?: unknown }).name;
  if (typeof maybeName === "string") {
    return maybeName;
  }
  const maybeNameHangul = (candidate as { nameHangul?: unknown }).nameHangul;
  if (typeof maybeNameHangul === "string") {
    return maybeNameHangul;
  }
  return "";
}

function splitStartEnd(name: string): { start: string; end: string } {
  const chars = [...name];
  const start = chars[0] ?? "";
  const end = chars.length > 0 ? chars[chars.length - 1] : "";
  return { start, end };
}

function normalizeLimit(limit: number): number {
  if (!Number.isFinite(limit)) {
    return 1;
  }
  return Math.max(1, Math.floor(limit));
}

function normalizeSeed(seed: number | undefined): number | null {
  if (typeof seed !== "number" || !Number.isFinite(seed)) {
    return null;
  }
  const parsed = Math.floor(seed);
  if (parsed < 1) {
    return null;
  }
  return parsed;
}

export function pickSeededWindow<TCandidate>(
  sortedCandidates: TCandidate[],
  options: SeededWindowOptions
): TCandidate[] {
  const limit = normalizeLimit(options.limit);
  if (sortedCandidates.length <= limit) {
    return sortedCandidates.slice(0, limit);
  }

  const seed = normalizeSeed(options.seed);
  if (seed == null) {
    return sortedCandidates.slice(0, limit);
  }

  const maxStart = sortedCandidates.length - limit;
  const startIndex = seed % (maxStart + 1);
  return sortedCandidates.slice(startIndex, startIndex + limit);
}

export function diversifyByStartEnd<TCandidate>(
  sortedCandidates: TCandidate[],
  options: StartEndDiversifyOptions<TCandidate>
): TCandidate[] {
  const limit = normalizeLimit(options.limit);
  const selected: TCandidate[] = [];
  const selectedIndex = new Set<number>();
  const selectedNames = new Set<string>();
  const startCount = new Map<string, number>();
  const endCount = new Map<string, number>();

  for (let i = 0; i < sortedCandidates.length; i += 1) {
    if (selected.length >= limit) {
      break;
    }
    const candidate = sortedCandidates[i];
    const name = resolveName(candidate, options.getName);
    if (!name || selectedNames.has(name)) {
      continue;
    }
    const { start, end } = splitStartEnd(name);
    if (!start || !end) {
      continue;
    }

    if ((startCount.get(start) ?? 0) >= options.maxSameStart) {
      continue;
    }
    if ((endCount.get(end) ?? 0) >= options.maxSameEnd) {
      continue;
    }

    selected.push(candidate);
    selectedIndex.add(i);
    selectedNames.add(name);
    startCount.set(start, (startCount.get(start) ?? 0) + 1);
    endCount.set(end, (endCount.get(end) ?? 0) + 1);
  }

  if (selected.length < limit) {
    for (let i = 0; i < sortedCandidates.length; i += 1) {
      if (selected.length >= limit) {
        break;
      }
      if (selectedIndex.has(i)) {
        continue;
      }
      const candidate = sortedCandidates[i];
      const name = resolveName(candidate, options.getName);
      if (!name || selectedNames.has(name)) {
        continue;
      }
      selected.push(candidate);
      selectedNames.add(name);
    }
  }

  return selected;
}
