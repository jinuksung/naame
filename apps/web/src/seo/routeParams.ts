import { notFound } from "next/navigation";
import {
  NormalizedGender,
  isValidSurnameParam,
  normalizeGenderParam,
} from "./seoConfig";

export function requireValidSurnameParam(value: string): string {
  const surname = value.trim();
  if (!isValidSurnameParam(surname)) {
    notFound();
  }
  return surname;
}

export function requireGenderParam(value: string): NormalizedGender {
  const gender = normalizeGenderParam(value);
  if (!gender) {
    notFound();
  }
  return gender;
}
