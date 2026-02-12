import assert from "node:assert/strict";
import {
  DEFAULT_SURNAME_INFLUENCE_CONFIG,
  elementSynergy,
  scoreBalance3,
  scoreSurnamePronunciationFlow,
  scoreSurnameSynergy
} from "./surnameInfluence";
import { FiveElement } from "../../types";

function runTests(): void {
  const m = DEFAULT_SURNAME_INFLUENCE_CONFIG.elementSynergyMatrix;

  assert.equal(elementSynergy("WOOD", "FIRE", m), 1, "목→화 should be generate(+1)");
  assert.equal(elementSynergy("WOOD", "EARTH", m), -1, "목⊣토 should be overcome(-1)");
  assert.equal(elementSynergy("WATER", "WATER", m), 0.2, "same element should be weak bonus");

  const highSynergy = scoreSurnameSynergy({
    surnameElement: "WOOD",
    char1Element: "FIRE",
    char2Element: "EARTH",
    config: DEFAULT_SURNAME_INFLUENCE_CONFIG
  });
  const lowSynergy = scoreSurnameSynergy({
    surnameElement: "METAL",
    char1Element: "WOOD",
    char2Element: "FIRE",
    config: DEFAULT_SURNAME_INFLUENCE_CONFIG
  });
  assert.ok(highSynergy.score > lowSynergy.score, "surname element change should alter synergy");

  const smooth = scoreSurnamePronunciationFlow("김", "서윤");
  const awkward = scoreSurnamePronunciationFlow("김", "김김");
  assert.ok(smooth.score > awkward.score, "same-syllable collision should be penalized");

  const balanced = scoreBalance3({
    surnameElement: "WOOD",
    char1Element: "FIRE",
    char2Element: "EARTH",
    config: DEFAULT_SURNAME_INFLUENCE_CONFIG
  });
  const skewed = scoreBalance3({
    surnameElement: "WOOD",
    char1Element: "WOOD",
    char2Element: "WOOD",
    config: DEFAULT_SURNAME_INFLUENCE_CONFIG
  });
  assert.ok(balanced.score > skewed.score, "3-char balance should penalize single-element concentration");

  const allElements: FiveElement[] = ["WOOD", "FIRE", "EARTH", "METAL", "WATER"];
  assert.equal(allElements.length, 5);

  console.log("[test:surname] all tests passed");
}

runTests();
