"use client";

import { ReactNode } from "react";

interface ScreenProps {
  title?: string;
  description?: string;
  titleIconSrc?: string;
  titleIconAlt?: string;
  children: ReactNode;
}

interface FieldProps {
  label: string;
  value: string;
  placeholder?: string;
  maxLength?: number;
  type?: "text" | "date" | "time";
  onChange: (value: string) => void;
  error?: string;
}

interface SegmentedOption<T extends string> {
  label: string;
  value: T;
}

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: Array<SegmentedOption<T>>;
  onChange: (value: T) => void;
}

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

interface CardProps {
  children: ReactNode;
}

interface SwitchProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

export function Screen({
  title,
  description,
  titleIconSrc,
  titleIconAlt,
  children,
}: ScreenProps): JSX.Element {
  return (
    <main className="nf-shell">
      <section className="nf-panel">
        {title ? (
          <h1 className="nf-title">
            <span className="nf-title-row">
              {titleIconSrc ? (
                <img
                  className="nf-title-icon"
                  src={titleIconSrc}
                  alt={titleIconAlt ?? ""}
                  aria-hidden={titleIconAlt ? undefined : true}
                />
              ) : null}
              <span>{title}</span>
            </span>
          </h1>
        ) : null}
        {description ? <p className="nf-description">{description}</p> : null}
        {children}
      </section>
    </main>
  );
}

export function Field({
  label,
  value,
  placeholder,
  maxLength,
  type = "text",
  onChange,
  error,
}: FieldProps): JSX.Element {
  const typeClass = type === "date" ? " nf-input-date" : type === "time" ? " nf-input-time" : "";

  return (
    <label className="nf-field">
      <span className="nf-label">{label}</span>
      <input
        className={`nf-input${typeClass}${error ? " is-error" : ""}`}
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <span className="nf-error">{error}</span> : null}
    </label>
  );
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedProps<T>): JSX.Element {
  return (
    <div className="nf-field">
      <span className="nf-label">{label}</span>
      <div className="nf-segmented" role="tablist" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`nf-segmented-option${value === option.value ? " is-selected" : ""}`}
            role="tab"
            aria-selected={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toggle({ checked, label, onChange }: SwitchProps): JSX.Element {
  return (
    <label className="nf-switch-row">
      <span className="nf-label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`nf-switch${checked ? " is-on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span className="nf-switch-thumb" />
      </button>
    </label>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps): JSX.Element {
  return (
    <button
      type={type}
      className="nf-button nf-button-primary"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps): JSX.Element {
  return (
    <button
      type={type}
      className="nf-button nf-button-secondary"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function Card({ children }: CardProps): JSX.Element {
  return <article className="nf-card">{children}</article>;
}
