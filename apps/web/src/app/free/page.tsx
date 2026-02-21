"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryButton, Screen, SegmentedControl } from "@/components/ui";
import { normalizeHangulReadingWithLimit } from "@namefit/engine/lib/korean/normalizeHangulReading";
import { fetchSurnameHanjaOptions } from "@/lib/api";
import { genderOptions, useRecommendStore } from "@/store/useRecommendStore";
import { FreeRecommendInput, SurnameHanjaOption } from "@/types/recommend";

interface FormErrors {
  surnameHangul?: string;
  surnameHanja?: string;
}

const TITLE_ICON_PATH = "/namefit-mark-inline.svg";

function countChars(value: string): number {
  return Array.from(value).length;
}

function validateInput(input: FreeRecommendInput): FormErrors {
  const errors: FormErrors = {};

  const surname = input.surnameHangul.trim();
  if (countChars(surname) < 1 || countChars(surname) > 2) {
    errors.surnameHangul = "성은 1~2글자로 입력해 주세요.";
  }

  const surnameHanja = input.surnameHanja.trim();
  if (countChars(surnameHanja) < 1 || countChars(surnameHanja) > 2) {
    errors.surnameHanja = "성씨 한자를 선택해 주세요.";
  }

  return errors;
}

export default function InputPage(): JSX.Element {
  const router = useRouter();
  const storeInput = useRecommendStore((state) => state.input);
  const setInput = useRecommendStore((state) => state.setInput);
  const setResults = useRecommendStore((state) => state.setResults);

  const [surnameHangul, setSurnameHangul] = useState(() =>
    normalizeHangulReadingWithLimit(storeInput.surnameHangul, 2),
  );
  const [surnameHanja, setSurnameHanja] = useState(storeInput.surnameHanja);
  const [surnameOptions, setSurnameOptions] = useState<SurnameHanjaOption[]>(
    [],
  );
  const [surnameOptionsLoading, setSurnameOptionsLoading] = useState(false);
  const [surnameOptionsError, setSurnameOptionsError] = useState<string | null>(
    null,
  );
  const [gender, setGender] = useState(storeInput.gender);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const reading = normalizeHangulReadingWithLimit(surnameHangul, 2);
    if (!reading) {
      setSurnameOptions([]);
      setSurnameHanja("");
      setSurnameOptionsError(null);
      setSurnameOptionsLoading(false);
      return;
    }

    const abortController = new AbortController();
    let cancelled = false;

    setSurnameOptionsLoading(true);
    setSurnameOptionsError(null);
    setSurnameOptions([]);

    void fetchSurnameHanjaOptions(reading, abortController.signal)
      .then((response) => {
        if (cancelled) {
          return;
        }

        setSurnameOptions(response.options);

        if (response.options.length === 0) {
          setSurnameHanja("");
          setSurnameOptionsError(
            "입력한 음과 일치하는 성씨 한자를 찾지 못했습니다.",
          );
          return;
        }

        setSurnameHanja((current) => {
          if (response.options.some((option) => option.hanja === current)) {
            return current;
          }
          return response.autoSelectedHanja ?? response.options[0].hanja;
        });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("[input] 성씨 한자 조회 실패", error);
        setSurnameOptions([]);
        setSurnameHanja("");
        setSurnameOptionsError("성씨 한자 조회 중 오류가 발생했습니다.");
      })
      .finally(() => {
        if (!cancelled) {
          setSurnameOptionsLoading(false);
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [surnameHangul]);

  const isSubmitDisabled = useMemo(
    () =>
      !surnameHangul.trim() || !surnameHanja.trim() || surnameOptionsLoading,
    [surnameHangul, surnameHanja, surnameOptionsLoading],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const nextInput: FreeRecommendInput = {
      surnameHangul: normalizeHangulReadingWithLimit(surnameHangul, 2),
      surnameHanja: surnameHanja.trim(),
      gender,
    };

    const validationErrors = validateInput(nextInput);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setInput(nextInput);
    setResults([]);
    router.push("/loading");
  };

  return (
    <Screen
      title="네임핏: 우리 아이 이름 찾기"
      titleIconSrc={TITLE_ICON_PATH}
      titleIconAlt="네임핏 로고"
    >
      <form className="nf-form" onSubmit={handleSubmit}>
        <div className="nf-field">
          <span className="nf-label">성(음) / 성씨 한자</span>
          <div className="nf-surname-row">
            <input
              className={`nf-input nf-surname-input${errors.surnameHangul ? " is-error" : ""}`}
              type="text"
              value={surnameHangul}
              placeholder="김"
              onChange={(event) => {
                setSurnameHangul(
                  normalizeHangulReadingWithLimit(event.target.value, 2),
                );
                setErrors((prev) => ({
                  ...prev,
                  surnameHangul: undefined,
                  surnameHanja: undefined,
                }));
              }}
            />

            {surnameHangul.trim() ? (
              surnameOptionsLoading ? (
                <p className="nf-surname-loading">한자 조회 중…</p>
              ) : surnameOptions.length > 0 ? (
                <div
                  className="nf-hanja-options"
                  role="radiogroup"
                  aria-label="성씨 한자 선택"
                >
                  {surnameOptions.map((option) => {
                    const isSelected = surnameHanja === option.hanja;

                    return (
                      <button
                        key={`${option.hanja}-${option.popularityRank}`}
                        type="button"
                        className={`nf-hanja-option${isSelected ? " is-selected" : ""}`}
                        aria-pressed={isSelected}
                        onClick={() => {
                          setSurnameHanja(option.hanja);
                          setErrors((prev) => ({
                            ...prev,
                            surnameHanja: undefined,
                          }));
                        }}
                      >
                        <span className="nf-hanja-main">{option.hanja}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null
            ) : null}
          </div>

          {!surnameOptionsLoading && surnameOptionsError ? (
            <span className="nf-error">{surnameOptionsError}</span>
          ) : null}
          {errors.surnameHangul ? (
            <span className="nf-error">{errors.surnameHangul}</span>
          ) : null}
          {errors.surnameHanja ? (
            <span className="nf-error">{errors.surnameHanja}</span>
          ) : null}
        </div>

        <SegmentedControl
          label="성별"
          value={gender}
          options={genderOptions}
          onChange={setGender}
        />

        <PrimaryButton type="submit" disabled={isSubmitDisabled}>
          이름 추천받기
        </PrimaryButton>

        <section
          className="nf-basic-mode-guide"
          aria-label="기본모드 이름 선정 기준"
        >
          <p className="nf-basic-mode-guide-title">
            기본모드에서는 아래 기준으로 이름을 선정합니다.
          </p>
          <ul className="nf-basic-mode-guide-list">
            <li>
              발음오행: 성과 이름을 붙여 읽었을 때 발음 흐름과 소리 균형을
              봅니다.
            </li>
            <li>의미: 한자 조합이 전달하는 의미의 조화와 선명도를 봅니다.</li>
            <li>
              오행 균형: 성씨와 이름의 오행 조합이 한쪽으로 치우치지 않는지
              봅니다.
            </li>
          </ul>
          <p className="nf-basic-mode-guide-note">
            ※ 오행 균형은 사주가 반영된 결과가 아닌, 성+이름의 오행만
            반영합니다.
          </p>
        </section>
      </form>
    </Screen>
  );
}
