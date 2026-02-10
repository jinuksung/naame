"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TdsField,
  TdsPrimaryButton,
  TdsScreen,
  TdsSegmentedControl,
  TdsSwitch
} from "@/components/tds";
import { genderOptions, useRecommendStore } from "@/store/useRecommendStore";
import { FreeRecommendInput } from "@/types/recommend";

interface FormErrors {
  surnameHangul?: string;
  date?: string;
}

function validateInput(input: FreeRecommendInput): FormErrors {
  const errors: FormErrors = {};

  const surname = input.surnameHangul.trim();
  if (surname.length < 1 || surname.length > 2) {
    errors.surnameHangul = "성은 1~2글자로 입력해 주세요.";
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

  const [surnameHangul, setSurnameHangul] = useState(storeInput.surnameHangul);
  const [date, setDate] = useState(storeInput.birth.date);
  const [gender, setGender] = useState(storeInput.gender);
  const [useBirthTime, setUseBirthTime] = useState(Boolean(storeInput.birth.time));
  const [time, setTime] = useState(storeInput.birth.time ?? "");
  const [errors, setErrors] = useState<FormErrors>({});

  const isSubmitDisabled = useMemo(() => !surnameHangul.trim() || !date, [surnameHangul, date]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const nextInput: FreeRecommendInput = {
      surnameHangul: surnameHangul.trim(),
      birth: {
        calendar: "SOLAR",
        date,
        time: useBirthTime && time ? time : undefined
      },
      gender
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
    <TdsScreen title="무료 작명 추천" description="출생 정보로 이름 TOP 5를 추천해 드려요.">
      <form className="tds-form" onSubmit={handleSubmit}>
        <TdsField
          label="성"
          value={surnameHangul}
          maxLength={2}
          placeholder="예: 성"
          onChange={setSurnameHangul}
          error={errors.surnameHangul}
        />

        <TdsField
          label="생년월일"
          type="date"
          value={date}
          onChange={setDate}
          error={errors.date}
        />

        <TdsSegmentedControl
          label="성별"
          value={gender}
          options={genderOptions}
          onChange={setGender}
        />

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
            placeholder="HH:mm"
          />
        ) : null}

        <TdsPrimaryButton type="submit" disabled={isSubmitDisabled}>
          이름 추천받기
        </TdsPrimaryButton>
      </form>
    </TdsScreen>
  );
}
