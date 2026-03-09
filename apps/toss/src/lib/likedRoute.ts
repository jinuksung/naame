export function resolveLikedPath(pathname: string): string {
  return pathname.startsWith("/feature/") ? "/feature/liked" : "/liked";
}

export function resolveRecommendInputPath(pathname: string): string {
  return pathname.startsWith("/feature/") ? "/feature/recommend" : "/free";
}
