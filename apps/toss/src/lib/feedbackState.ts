export type FeedbackStatus = "idle" | "pending" | "done";
export type FeedbackVote = "like" | "dislike" | undefined;

function hasOwnKey<T extends object>(target: T, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(target, key);
}

function hasSameKeySet(prev: Record<string, unknown>, keys: readonly string[]): boolean {
  const prevKeys = Object.keys(prev);
  if (prevKeys.length !== keys.length) {
    return false;
  }
  for (const key of keys) {
    if (!hasOwnKey(prev, key)) {
      return false;
    }
  }
  return true;
}

export function syncFeedbackStatus(
  prev: Record<string, FeedbackStatus>,
  keys: readonly string[],
): Record<string, FeedbackStatus> {
  let changed = !hasSameKeySet(prev, keys);
  const next: Record<string, FeedbackStatus> = {};

  for (const key of keys) {
    if (hasOwnKey(prev, key)) {
      next[key] = prev[key];
      continue;
    }
    next[key] = "idle";
    changed = true;
  }

  return changed ? next : prev;
}

export function syncFeedbackVote(
  prev: Record<string, FeedbackVote>,
  keys: readonly string[],
): Record<string, FeedbackVote> {
  let changed = !hasSameKeySet(prev, keys);
  const next: Record<string, FeedbackVote> = {};

  for (const key of keys) {
    if (hasOwnKey(prev, key)) {
      next[key] = prev[key];
      continue;
    }
    next[key] = undefined;
    changed = true;
  }

  return changed ? next : prev;
}
