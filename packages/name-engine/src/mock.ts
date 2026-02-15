import { FreeRecommendInput, FreeRecommendResultItem } from "./types/recommend";

const MOCK_POOL: FreeRecommendResultItem[] = [
  {
    nameHangul: "윤재",
    hanjaPair: ["潤", "宰"],
    readingPair: ["윤", "재"],
    meaningKwPair: ["윤택할", "재상"],
    score: 93,
    reasons: ["발음이 부드럽고 또렷해요", "안정과 성장의 의미 조합이에요", "성씨와 연결 발음이 자연스러워요"]
  },
  {
    nameHangul: "서현",
    hanjaPair: ["瑞", "賢"],
    readingPair: ["서", "현"],
    meaningKwPair: ["상서로울", "어질"],
    score: 92,
    reasons: ["밝고 신뢰감 있는 인상이에요", "길상과 지혜 의미를 담았어요", "일상 호칭에서 부르기 쉬워요"]
  },
  {
    nameHangul: "지우",
    hanjaPair: ["智", "祐"],
    readingPair: ["지", "우"],
    meaningKwPair: ["지혜", "도울"],
    score: 91,
    reasons: ["짧고 기억하기 쉬운 구조예요", "지혜와 도움의 의미 균형이 좋아요"]
  },
  {
    nameHangul: "도윤",
    hanjaPair: ["度", "胤"],
    readingPair: ["도", "윤"],
    meaningKwPair: ["법도", "이을"],
    score: 90,
    reasons: ["중성적인 발음으로 활용 폭이 넓어요", "품격과 계승의 의미를 담았어요", "성+이름 리듬이 안정적이에요"]
  },
  {
    nameHangul: "하린",
    hanjaPair: ["河", "璘"],
    readingPair: ["하", "린"],
    meaningKwPair: ["물", "옥빛"],
    score: 89,
    reasons: ["맑고 세련된 발음 인상을 줘요", "넓음과 빛남의 상징을 담았어요"]
  },
  {
    nameHangul: "민서",
    hanjaPair: ["敏", "瑞"],
    readingPair: ["민", "서"],
    meaningKwPair: ["민첩할", "상서로울"],
    score: 88,
    reasons: ["발음이 부드럽고 빠르게 익숙해져요", "총명함과 길상의 의미가 어울려요"]
  },
  {
    nameHangul: "예준",
    hanjaPair: ["叡", "俊"],
    readingPair: ["예", "준"],
    meaningKwPair: ["밝을", "준걸"],
    score: 87,
    reasons: ["선명한 발음으로 전달력이 좋아요", "지혜와 준수함의 의미 조합이에요"]
  }
];

function hashSeed(input: FreeRecommendInput): number {
  const seedText = `${input.surnameHangul}|${input.surnameHanja}|${input.birth?.date ?? ""}|${input.gender}|${input.birth?.time ?? ""}|${input.exploreSeed ?? ""}`;
  let hash = 0;
  for (const ch of seedText) {
    hash = (hash * 31 + ch.charCodeAt(0)) % 1_000_000_007;
  }
  return hash;
}

function pickUniqueIndexes(seed: number, poolSize: number, count: number): number[] {
  const picked = new Set<number>();
  let cursor = seed;
  while (picked.size < Math.min(count, poolSize)) {
    cursor = (cursor * 1103515245 + 12345) % 0x7fffffff;
    picked.add(cursor % poolSize);
  }
  return Array.from(picked);
}

export function buildMockResults(input: FreeRecommendInput): FreeRecommendResultItem[] {
  const seed = hashSeed(input);
  const indexes = pickUniqueIndexes(seed, MOCK_POOL.length, 5);
  return indexes.map((index) => MOCK_POOL[index]);
}
