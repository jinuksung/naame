"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TdsField,
  TdsPrimaryButton,
  TdsScreen,
  TdsSegmentedControl,
  TdsSwitch,
} from "@/components/tds";
import { normalizeHangulReadingWithLimit } from "@namefit/engine/lib/korean/normalizeHangulReading";
import { fetchSurnameHanjaOptions } from "@/lib/api";
import { genderOptions, useRecommendStore } from "@/store/useRecommendStore";
import { FreeRecommendInput, SurnameHanjaOption } from "@/types/recommend";

interface FormErrors {
  surnameHangul?: string;
  surnameHanja?: string;
  date?: string;
}

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

  if (!input.birth.date) {
    errors.date = "생년월일을 선택해 주세요.";
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
  const [surnameOptions, setSurnameOptions] = useState<SurnameHanjaOption[]>([]);
  const [surnameOptionsLoading, setSurnameOptionsLoading] = useState(false);
  const [surnameOptionsError, setSurnameOptionsError] = useState<string | null>(null);
  const [date, setDate] = useState(storeInput.birth.date);
  const [gender, setGender] = useState(storeInput.gender);
  const [useBirthTime, setUseBirthTime] = useState(
    Boolean(storeInput.birth.time),
  );
  const [time, setTime] = useState(storeInput.birth.time ?? "");
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
          setSurnameOptionsError("입력한 음과 일치하는 성씨 한자를 찾지 못했습니다.");
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
    () => !surnameHangul.trim() || !surnameHanja.trim() || !date || surnameOptionsLoading,
    [surnameHangul, surnameHanja, date, surnameOptionsLoading],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const nextInput: FreeRecommendInput = {
      surnameHangul: normalizeHangulReadingWithLimit(surnameHangul, 2),
      surnameHanja: surnameHanja.trim(),
      birth: {
        calendar: "SOLAR",
        date,
        time: useBirthTime && time ? time : undefined,
      },
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
    <TdsScreen
      title="네임핏: 우리 아이 이름 찾기"
      description="발음·의미·사용 데이터를 기준으로 조건에 맞는 이름을 찾습니다"
    >
      <form className="tds-form" onSubmit={handleSubmit}>
        <div className="tds-field">
          <span className="tds-label">성(음) / 성씨 한자</span>
          <div className="surname-inline-row">
            <input
              className={`tds-input surname-inline-input${errors.surnameHangul ? " is-error" : ""}`}
              type="text"
              value={surnameHangul}
              placeholder="김"
              onChange={(event) => {
                setSurnameHangul(normalizeHangulReadingWithLimit(event.target.value, 2));
                setErrors((prev) => ({ ...prev, surnameHangul: undefined, surnameHanja: undefined }));
              }}
            />

            {surnameHangul.trim() ? (
              surnameOptionsLoading ? (
                <p className="surname-inline-loading">한자 조회 중…</p>
              ) : surnameOptions.length > 0 ? (
                <div className="tds-hanja-options" role="radiogroup" aria-label="성씨 한자 선택">
                  {surnameOptions.map((option) => {
                    const isSelected = surnameHanja === option.hanja;

                    return (
                      <button
                        key={`${option.hanja}-${option.popularityRank}`}
                        type="button"
                        className={`tds-hanja-option${isSelected ? " is-selected" : ""}`}
                        aria-pressed={isSelected}
                        onClick={() => {
                          setSurnameHanja(option.hanja);
                          setErrors((prev) => ({ ...prev, surnameHanja: undefined }));
                        }}
                      >
                        <span className="tds-hanja-main">{option.hanja}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null
            ) : null}
          </div>

          {!surnameOptionsLoading && surnameOptionsError ? (
            <span className="tds-error">{surnameOptionsError}</span>
          ) : null}
          {errors.surnameHangul ? <span className="tds-error">{errors.surnameHangul}</span> : null}
          {errors.surnameHanja ? <span className="tds-error">{errors.surnameHanja}</span> : null}
        </div>

        <TdsField
          label="생년월일"
          type="date"
          value={date}
          onChange={setDate}
          error={errors.date}
        />

        <p className="tds-helper-text">
          생년월일, 출생시간은 참고용으로만 사용되며 결과에 큰 영향을 주지 않습니다.
        </p>

        <TdsSwitch
          label="출생시간 입력"
          checked={useBirthTime}
          onChange={(checked) => {
            setUseBirthTime(checked);
            if (!checked) {
              setTime("");
            }
          }}
        />

        {useBirthTime ? (
          <TdsField
            label="출생시간"
            type="time"
            value={time}
            onChange={setTime}
          />
        ) : null}

        <TdsSegmentedControl
          label="성별"
          value={gender}
          options={genderOptions}
          onChange={setGender}
        />

        <TdsPrimaryButton type="submit" disabled={isSubmitDisabled}>
          이름 추천받기
        </TdsPrimaryButton>
      </form>
    </TdsScreen>
  );
}
