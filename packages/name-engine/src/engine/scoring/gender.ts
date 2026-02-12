import { Gender, ScoreResult } from "../../types";

export function scoreGender(_nameHangul: string, _gender: Gender): ScoreResult {
  return {
    score: 0,
    reasons: ["성별 태그 데이터 없음"]
  };
}
