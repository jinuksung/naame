"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TdsPrimaryButton,
  TdsScreen,
  TdsSegmentedControl,
  TdsSwitch
} from "@/components/tds";
import { fetchSurnameHanjaOptions } from "@/lib/api";
import { normalizeHangulReadingWithLimit } from "@/lib/korean/normalizeHangulReading";
import {
  buildLocalQuickPremiumPayload,
  resolvePremiumLoadingPath
} from "@/lib/localQuickPremium";
import { isLocalAdminToolsEnabled } from "@namefit/engine/lib/localAdminVisibility";
import { genderOptions } from "@/store/useRecommendStore";
import { usePremiumRecommendStore } from "@/store/usePremiumRecommendStore";
import { PremiumRecommendInput, SurnameHanjaOption } from "@/types/recommend";
import {
  type Meridiem,
  buildIsoDate,
  buildTime24h,
  normalizeDayInput,
  normalizeMinuteInput,
  normalizeYearInput,
  resolveHourInput,
  resolveMonthInput,
  splitIsoDate,
  splitTime24h
} from "./inputFields";

interface PremiumFormErrors {
  date?: string;
  time?: string;
  surnameHangul?: string;
  surnameHanja?: string;
}

const TITLE_ICON_PATH = "/namefit-mark-inline.svg";

function countChars(value: string): number {
  return Array.from(value).length;
}

function validateInput(params: {
  date: string | null;
  hasAnyTimeInput: boolean;
  time: string | null;
  surnameHanja: string;
  surnameHangul: string;
}): PremiumFormErrors {
  const errors: PremiumFormErrors = {};

  if (!params.date) {
    errors.date = "생년월일을 정확히 입력해 주세요.";
  }

  if (params.hasAnyTimeInput && !params.time) {
    errors.time = "출생시간을 정확히 입력해 주세요.";
  }

  const surnameReading = normalizeHangulReadingWithLimit(params.surnameHangul, 2);
  if (countChars(surnameReading) < 1 || countChars(surnameReading) > 2) {
    errors.surnameHangul = "성은 1~2글자로 입력해 주세요.";
  }

  const surnameHanja = params.surnameHanja.trim();
  if (countChars(surnameHanja) < 1 || countChars(surnameHanja) > 2) {
    errors.surnameHanja = "성씨 한자를 선택해 주세요.";
  }

  return errors;
}

export default function PremiumInputPage(): JSX.Element {
  const router = useRouter();
  const storeInput = usePremiumRecommendStore((state) => state.input);
  const storeSurnameHangul = usePremiumRecommendStore((state) => state.surnameHangul);
  const setInput = usePremiumRecommendStore((state) => state.setInput);
  const setStoredSurnameHangul = usePremiumRecommendStore((state) => state.setSurnameHangul);
  const setSummary = usePremiumRecommendStore((state) => state.setSummary);
  const setResults = usePremiumRecommendStore((state) => state.setResults);
  const defaultDateParts = splitIsoDate(storeInput.birth.date);
  const defaultTimeParts = splitTime24h(storeInput.birth.time);

  const [birthYear, setBirthYear] = useState(defaultDateParts.year);
  const [birthMonth, setBirthMonth] = useState(defaultDateParts.month);
  const [birthDay, setBirthDay] = useState(defaultDateParts.day);
  const [calendar, setCalendar] = useState<"SOLAR" | "LUNAR">(storeInput.birth.calendar);
  const [isLeapMonth, setIsLeapMonth] = useState(storeInput.birth.isLeapMonth === true);
  const [birthMeridiem, setBirthMeridiem] = useState<Meridiem>(defaultTimeParts.meridiem);
  const [birthHour, setBirthHour] = useState(defaultTimeParts.hour);
  const [birthMinute, setBirthMinute] = useState(defaultTimeParts.minute);
  const [surnameHangul, setSurnameHangul] = useState(() =>
    normalizeHangulReadingWithLimit(storeSurnameHangul, 2)
  );
  const [surnameHanja, setSurnameHanja] = useState(storeInput.surnameHanja);
  const [surnameOptions, setSurnameOptions] = useState<SurnameHanjaOption[]>([]);
  const [surnameOptionsLoading, setSurnameOptionsLoading] = useState(false);
  const [surnameOptionsError, setSurnameOptionsError] = useState<string | null>(null);
  const [gender, setGender] = useState(storeInput.gender);
  const [errors, setErrors] = useState<PremiumFormErrors>({});
  const [localAdminEnabled, setLocalAdminEnabled] = useState(false);
  const birthMonthRef = useRef<HTMLInputElement>(null);
  const birthDayRef = useRef<HTMLInputElement>(null);
  const birthMinuteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setLocalAdminEnabled(
      isLocalAdminToolsEnabled({
        hostname: window.location.hostname
      })
    );
  }, []);

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

        console.error("[premium-input] 성씨 한자 조회 실패", error);
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
      !birthYear.trim() ||
      !birthMonth.trim() ||
      !birthDay.trim() ||
      !surnameHangul.trim() ||
      !surnameHanja.trim() ||
      surnameOptionsLoading,
    [birthDay, birthMonth, birthYear, surnameHangul, surnameHanja, surnameOptionsLoading]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const birthDate = buildIsoDate(birthYear, birthMonth, birthDay);
    const hasAnyTimeInput = birthHour.trim().length > 0 || birthMinute.trim().length > 0;
    const birthTime = buildTime24h(birthMeridiem, birthHour, birthMinute);
    const normalizedSurnameHangul = normalizeHangulReadingWithLimit(surnameHangul, 2);
    const validationErrors = validateInput({
      date: birthDate,
      hasAnyTimeInput,
      time: birthTime,
      surnameHanja,
      surnameHangul: normalizedSurnameHangul
    });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0 || !birthDate) {
      return;
    }

    const nextInput: PremiumRecommendInput = {
      birth: {
        calendar,
        date: birthDate,
        ...(calendar === "LUNAR" && isLeapMonth ? { isLeapMonth: true } : {}),
        ...(birthTime ? { time: birthTime } : {})
      },
      surnameHanja: surnameHanja.trim(),
      gender
    };

    const loadingPath =
      typeof window === "undefined"
        ? "/premium/loading"
        : resolvePremiumLoadingPath(window.location.pathname);

    setInput(nextInput);
    setStoredSurnameHangul(normalizedSurnameHangul);
    setSummary(null);
    setResults([]);
    router.push(loadingPath);
  };

  const handleLocalQuickStart = (): void => {
    const payload = buildLocalQuickPremiumPayload();
    const loadingPath =
      typeof window === "undefined"
        ? "/premium/loading"
        : resolvePremiumLoadingPath(window.location.pathname);
    const quickDate = splitIsoDate(payload.input.birth.date);
    const quickTime = splitTime24h(payload.input.birth.time);

    setBirthYear(quickDate.year);
    setBirthMonth(quickDate.month);
    setBirthDay(quickDate.day);
    setCalendar(payload.input.birth.calendar);
    setIsLeapMonth(payload.input.birth.isLeapMonth === true);
    setBirthMeridiem(quickTime.meridiem);
    setBirthHour(quickTime.hour);
    setBirthMinute(quickTime.minute);
    setSurnameHangul(payload.surnameHangul);
    setSurnameHanja(payload.input.surnameHanja);
    setGender(payload.input.gender);
    setErrors({});

    setInput(payload.input);
    setStoredSurnameHangul(payload.surnameHangul);
    setSummary(null);
    setResults([]);
    router.push(loadingPath);
  };

  return (
    <TdsScreen
      title="네임핏 프리미엄"
      titleIconSrc={TITLE_ICON_PATH}
      titleIconAlt="네임핏 로고"
      description="사주 기반으로 이름을 분석해 추천합니다."
    >
      <p className="tds-premium-top-note">
        현재 한시적으로 유료 버전을 무료로 제공 중이며 추후 유료 전환될 수 있습니다.
      </p>
      <form className="tds-form" onSubmit={handleSubmit}>
        <div className="tds-field">
          <span className="tds-label">생년월일</span>
          <div className="tds-inline-input-row">
            <label className="tds-inline-unit">
              <input
                className={`tds-input tds-inline-input tds-inline-input-year${errors.date ? " is-error" : ""}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={birthYear}
                placeholder="YYYY"
                onChange={(event) => {
                  const nextYear = normalizeYearInput(event.target.value);
                  setBirthYear(nextYear);
                  setErrors((prev) => ({ ...prev, date: undefined }));
                  if (nextYear.length === 4) {
                    birthMonthRef.current?.focus();
                  }
                }}
              />
              <span className="tds-inline-suffix">년</span>
            </label>

            <label className="tds-inline-unit">
              <input
                ref={birthMonthRef}
                className={`tds-input tds-inline-input${errors.date ? " is-error" : ""}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={birthMonth}
                placeholder="월"
                onChange={(event) => {
                  const nextMonth = resolveMonthInput(event.target.value);
                  setBirthMonth(nextMonth.value);
                  setErrors((prev) => ({ ...prev, date: undefined }));
                  if (nextMonth.moveNext) {
                    birthDayRef.current?.focus();
                  }
                }}
              />
              <span className="tds-inline-suffix">월</span>
            </label>

            <label className="tds-inline-unit">
              <input
                ref={birthDayRef}
                className={`tds-input tds-inline-input${errors.date ? " is-error" : ""}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={birthDay}
                placeholder="일"
                onChange={(event) => {
                  setBirthDay(normalizeDayInput(event.target.value));
                  setErrors((prev) => ({ ...prev, date: undefined }));
                }}
              />
              <span className="tds-inline-suffix">일</span>
            </label>
          </div>
          {errors.date ? <span className="tds-error">{errors.date}</span> : null}
        </div>

        <TdsSegmentedControl
          label="양력 / 음력"
          value={calendar}
          options={[
            { label: "양력", value: "SOLAR" },
            { label: "음력", value: "LUNAR" }
          ]}
          onChange={(nextCalendar) => {
            setCalendar(nextCalendar);
            if (nextCalendar === "SOLAR") {
              setIsLeapMonth(false);
            }
          }}
        />

        {calendar === "LUNAR" ? (
          <TdsSwitch checked={isLeapMonth} label="윤달" onChange={setIsLeapMonth} />
        ) : null}

        <div className="tds-field">
          <span className="tds-label">출생시간</span>
          <div className="tds-time-inline-row">
            <div className="tds-meridiem tds-meridiem-inline">
              <button
                type="button"
                className={`tds-meridiem-option${birthMeridiem === "AM" ? " is-selected" : ""}`}
                onClick={() => setBirthMeridiem("AM")}
              >
                오전
              </button>
              <button
                type="button"
                className={`tds-meridiem-option${birthMeridiem === "PM" ? " is-selected" : ""}`}
                onClick={() => setBirthMeridiem("PM")}
              >
                오후
              </button>
            </div>
            <div className="tds-inline-input-row tds-time-value-row">
              <label className="tds-inline-unit">
                <input
                  className={`tds-input tds-inline-input${errors.time ? " is-error" : ""}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={birthHour}
                  placeholder="시"
                  onChange={(event) => {
                    const nextHour = resolveHourInput(event.target.value);
                    setBirthHour(nextHour.value);
                    setErrors((prev) => ({ ...prev, time: undefined }));
                    if (nextHour.moveNext) {
                      birthMinuteRef.current?.focus();
                    }
                  }}
                />
                <span className="tds-inline-suffix">시</span>
              </label>
              <label className="tds-inline-unit">
                <input
                  ref={birthMinuteRef}
                  className={`tds-input tds-inline-input${errors.time ? " is-error" : ""}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={birthMinute}
                  placeholder="분"
                  onChange={(event) => {
                    setBirthMinute(normalizeMinuteInput(event.target.value));
                    setErrors((prev) => ({ ...prev, time: undefined }));
                  }}
                />
                <span className="tds-inline-suffix">분</span>
              </label>
            </div>
          </div>
          <p className="tds-helper-text">모르면 비워두세요. 입력 시 더 정확한 분석이 가능합니다.</p>
          {errors.time ? <span className="tds-error">{errors.time}</span> : null}
        </div>

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
                setErrors((prev) => ({
                  ...prev,
                  surnameHangul: undefined,
                  surnameHanja: undefined
                }));
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
                          setErrors((prev) => ({
                            ...prev,
                            surnameHanja: undefined
                          }));
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

        <TdsSegmentedControl
          label="이름 느낌"
          value={gender}
          options={genderOptions}
          onChange={setGender}
        />

        <TdsPrimaryButton type="submit" disabled={isSubmitDisabled}>
          사주 기반 분석 시작
        </TdsPrimaryButton>

        {localAdminEnabled ? (
          <div className="local-admin-name-row">
            <button
              type="button"
              className="local-admin-btn local-admin-btn-minimal"
              onClick={handleLocalQuickStart}
            >
              로컬 자동 입력으로 바로 조회
            </button>
          </div>
        ) : null}
      </form>
    </TdsScreen>
  );
}
