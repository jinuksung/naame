"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TdsField,
  TdsPrimaryButton,
  TdsScreen,
  TdsSegmentedControl,
  TdsSwitch
} from "@/components/tds";
import { genderOptions } from "@/store/useRecommendStore";
import { usePremiumRecommendStore } from "@/store/usePremiumRecommendStore";
import { PremiumRecommendInput } from "@/types/recommend";

interface PremiumFormErrors {
  date?: string;
  time?: string;
  surnameHanja?: string;
}

const TITLE_ICON_PATH = "/namefit-mark-inline.svg";

function countChars(value: string): number {
  return Array.from(value).length;
}

function validateInput(input: PremiumRecommendInput): PremiumFormErrors {
  const errors: PremiumFormErrors = {};

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birth.date.trim())) {
    errors.date = "생년월일을 YYYY-MM-DD 형식으로 입력해 주세요.";
  }

  const time = input.birth.time?.trim();
  if (time && !/^\d{2}:\d{2}$/.test(time)) {
    errors.time = "출생시간을 HH:mm 형식으로 입력해 주세요.";
  }

  const surnameHanja = input.surnameHanja.trim();
  if (countChars(surnameHanja) < 1 || countChars(surnameHanja) > 2) {
    errors.surnameHanja = "성씨 한자를 1~2글자로 입력해 주세요.";
  }

  return errors;
}

export default function PremiumInputPage(): JSX.Element {
  const router = useRouter();
  const storeInput = usePremiumRecommendStore((state) => state.input);
  const setInput = usePremiumRecommendStore((state) => state.setInput);
  const setSummary = usePremiumRecommendStore((state) => state.setSummary);
  const setResults = usePremiumRecommendStore((state) => state.setResults);

  const [date, setDate] = useState(storeInput.birth.date);
  const [calendar, setCalendar] = useState<"SOLAR" | "LUNAR">(storeInput.birth.calendar);
  const [isLeapMonth, setIsLeapMonth] = useState(storeInput.birth.isLeapMonth === true);
  const [time, setTime] = useState(storeInput.birth.time ?? "");
  const [surnameHanja, setSurnameHanja] = useState(storeInput.surnameHanja);
  const [gender, setGender] = useState(storeInput.gender);
  const [errors, setErrors] = useState<PremiumFormErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const nextInput: PremiumRecommendInput = {
      birth: {
        calendar,
        date: date.trim(),
        ...(calendar === "LUNAR" && isLeapMonth ? { isLeapMonth: true } : {}),
        ...(time.trim() ? { time: time.trim() } : {})
      },
      surnameHanja: surnameHanja.trim(),
      gender
    };

    const validationErrors = validateInput(nextInput);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setInput(nextInput);
    setSummary(null);
    setResults([]);
    router.push("/premium/loading");
  };

  return (
    <TdsScreen
      title="네임핏 프리미엄"
      titleIconSrc={TITLE_ICON_PATH}
      titleIconAlt="네임핏 로고"
      description="사주 기반으로 이름을 분석해 추천합니다."
    >
      <form className="tds-form" onSubmit={handleSubmit}>
        <TdsField
          label="생년월일"
          type="date"
          value={date}
          onChange={(value) => {
            setDate(value);
            setErrors((prev) => ({ ...prev, date: undefined }));
          }}
          error={errors.date}
        />

        <TdsSegmentedControl
          label="양력 / 음력"
          value={calendar}
          options={[
            { label: "양력", value: "SOLAR" },
            { label: "음력", value: "LUNAR" }
          ]}
          onChange={setCalendar}
        />

        {calendar === "LUNAR" ? (
          <TdsSwitch checked={isLeapMonth} label="윤달" onChange={setIsLeapMonth} />
        ) : null}

        <div className="tds-field">
          <TdsField
            label="출생시간"
            type="time"
            value={time}
            placeholder="모르면 비워두세요"
            onChange={(value) => {
              setTime(value);
              setErrors((prev) => ({ ...prev, time: undefined }));
            }}
            error={errors.time}
          />
          <p className="tds-helper-text">입력 시 더 정확한 분석이 가능합니다</p>
        </div>

        <TdsField
          label="성씨 한자"
          value={surnameHanja}
          maxLength={2}
          placeholder="金"
          onChange={(value) => {
            setSurnameHanja(value.trim().normalize("NFC"));
            setErrors((prev) => ({ ...prev, surnameHanja: undefined }));
          }}
          error={errors.surnameHanja}
        />

        <TdsSegmentedControl
          label="성별"
          value={gender}
          options={genderOptions}
          onChange={setGender}
        />

        <TdsPrimaryButton type="submit">사주 기반 분석 시작</TdsPrimaryButton>
      </form>
    </TdsScreen>
  );
}
