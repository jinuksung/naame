export type Meridiem = "AM" | "PM";

interface ResolveInputResult {
  value: string;
  moveNext: boolean;
}

interface DateParts {
  year: string;
  month: string;
  day: string;
}

interface TimeParts {
  meridiem: Meridiem;
  hour: string;
  minute: string;
}

function onlyDigits(value: string, maxLength: number): string {
  return value.replace(/[^\d]/g, "").slice(0, maxLength);
}

function normalizeTwoDigit(value: number): string {
  return value.toString().padStart(2, "0");
}

export function resolveMonthInput(rawValue: string): ResolveInputResult {
  const digits = onlyDigits(rawValue, 2);
  if (!digits) {
    return { value: "", moveNext: false };
  }

  if (digits[0] !== "1") {
    return { value: digits[0], moveNext: true };
  }

  if (digits.length === 1) {
    return { value: "1", moveNext: false };
  }

  const second = digits[1];
  if (second === "0" || second === "1" || second === "2") {
    return { value: `1${second}`, moveNext: true };
  }

  return { value: "1", moveNext: true };
}

export function resolveHourInput(rawValue: string): ResolveInputResult {
  const digits = onlyDigits(rawValue, 2);
  if (!digits) {
    return { value: "", moveNext: false };
  }

  if (digits[0] !== "1") {
    return { value: digits[0], moveNext: true };
  }

  if (digits.length === 1) {
    return { value: "1", moveNext: false };
  }

  const second = digits[1];
  if (second === "0" || second === "1" || second === "2") {
    return { value: `1${second}`, moveNext: true };
  }

  return { value: "1", moveNext: true };
}

export function normalizeYearInput(rawValue: string): string {
  return onlyDigits(rawValue, 4);
}

export function normalizeDayInput(rawValue: string): string {
  return onlyDigits(rawValue, 2);
}

export function normalizeMinuteInput(rawValue: string): string {
  return onlyDigits(rawValue, 2);
}

export function splitIsoDate(date: string): DateParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  if (!match) {
    return { year: "", month: "", day: "" };
  }

  return {
    year: match[1],
    month: Number.parseInt(match[2], 10).toString(),
    day: Number.parseInt(match[3], 10).toString()
  };
}

export function buildIsoDate(yearRaw: string, monthRaw: string, dayRaw: string): string | null {
  const yearDigits = onlyDigits(yearRaw, 4);
  const monthDigits = onlyDigits(monthRaw, 2);
  const dayDigits = onlyDigits(dayRaw, 2);

  if (yearDigits.length !== 4 || !monthDigits || !dayDigits) {
    return null;
  }

  const year = Number.parseInt(yearDigits, 10);
  const month = Number.parseInt(monthDigits, 10);
  const day = Number.parseInt(dayDigits, 10);

  if (!Number.isInteger(year) || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${yearDigits}-${normalizeTwoDigit(month)}-${normalizeTwoDigit(day)}`;
}

export function splitTime24h(time: string | undefined): TimeParts {
  if (!time) {
    return { meridiem: "AM", hour: "", minute: "" };
  }

  const match = /^(\d{2}):(\d{2})$/.exec(time.trim());
  if (!match) {
    return { meridiem: "AM", hour: "", minute: "" };
  }

  const hour24 = Number.parseInt(match[1], 10);
  const minute = Number.parseInt(match[2], 10);
  if (hour24 < 0 || hour24 > 23 || minute < 0 || minute > 59) {
    return { meridiem: "AM", hour: "", minute: "" };
  }

  if (hour24 === 0) {
    return { meridiem: "AM", hour: "12", minute: minute.toString() };
  }
  if (hour24 < 12) {
    return { meridiem: "AM", hour: hour24.toString(), minute: minute.toString() };
  }
  if (hour24 === 12) {
    return { meridiem: "PM", hour: "12", minute: minute.toString() };
  }
  return { meridiem: "PM", hour: (hour24 - 12).toString(), minute: minute.toString() };
}

export function buildTime24h(
  meridiem: Meridiem,
  hourRaw: string,
  minuteRaw: string
): string | null {
  const hourDigits = onlyDigits(hourRaw, 2);
  const minuteDigits = onlyDigits(minuteRaw, 2);

  if (!hourDigits && !minuteDigits) {
    return null;
  }

  if (!hourDigits || !minuteDigits) {
    return null;
  }

  const hour = Number.parseInt(hourDigits, 10);
  const minute = Number.parseInt(minuteDigits, 10);
  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    return null;
  }

  const hour24 = meridiem === "AM" ? hour % 12 : (hour % 12) + 12;
  return `${normalizeTwoDigit(hour24)}:${normalizeTwoDigit(minute)}`;
}
