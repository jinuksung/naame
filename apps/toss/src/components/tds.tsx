"use client";

import Link from "next/link";
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

interface LinkButtonProps {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary";
}

interface BottomCtaDoubleProps {
  left: ReactNode;
  right: ReactNode;
  topAccessory?: ReactNode;
}

interface CardProps {
  children: ReactNode;
}

export function TdsScreen({
  title,
  description,
  titleIconSrc,
  titleIconAlt,
  children,
}: ScreenProps): JSX.Element {
  return (
    <main className="tds-screen">
      <section className="tds-panel">
        {title ? (
          <h1 className="tds-title">
            <span className="tds-title-row">
              {titleIconSrc ? (
                <img
                  className="tds-title-icon"
                  src={titleIconSrc}
                  alt={titleIconAlt ?? ""}
                  aria-hidden={titleIconAlt ? undefined : true}
                />
              ) : null}
              <span>{title}</span>
            </span>
          </h1>
        ) : null}
        {description ? <p className="tds-description">{description}</p> : null}
        {children}
      </section>
    </main>
  );
}

export function TdsField({
  label,
  value,
  placeholder,
  maxLength,
  type = "text",
  onChange,
  error
}: FieldProps): JSX.Element {
  const typeClass = type === "date" ? " tds-input-date" : type === "time" ? " tds-input-time" : "";

  return (
    <label className="tds-field">
      <span className="tds-label">{label}</span>
      <input
        className={`tds-input${typeClass}${error ? " is-error" : ""}`}
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <span className="tds-error">{error}</span> : null}
    </label>
  );
}

export function TdsSegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange
}: SegmentedProps<T>): JSX.Element {
  return (
    <div className="tds-field">
      <span className="tds-label">{label}</span>
      <div className="tds-segmented" role="tablist" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`tds-segmented-option${value === option.value ? " is-selected" : ""}`}
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

interface SwitchProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

export function TdsSwitch({ checked, label, onChange }: SwitchProps): JSX.Element {
  return (
    <label className="tds-switch-row">
      <span className="tds-label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`tds-switch${checked ? " is-on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span className="tds-switch-thumb" />
      </button>
    </label>
  );
}

export function TdsPrimaryButton({
  children,
  onClick,
  type = "button",
  disabled = false
}: ButtonProps): JSX.Element {
  return (
    <button
      type={type}
      className="tds-button tds-button-primary"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="tds-button-label">{children}</span>
    </button>
  );
}

export function TdsSecondaryButton({
  children,
  onClick,
  type = "button",
  disabled = false
}: ButtonProps): JSX.Element {
  return (
    <button
      type={type}
      className="tds-button tds-button-secondary"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="tds-button-label">{children}</span>
    </button>
  );
}

export function TdsLinkButton({
  children,
  href,
  variant = "primary"
}: LinkButtonProps): JSX.Element {
  const variantClass = variant === "secondary" ? "tds-button-secondary" : "tds-button-primary";
  return (
    <Link href={href} className={`tds-button ${variantClass}`}>
      <span className="tds-button-label">{children}</span>
    </Link>
  );
}

export function TdsBottomCtaDouble({
  left,
  right,
  topAccessory
}: BottomCtaDoubleProps): JSX.Element {
  return (
    <div className="tds-bottom-cta tds-bottom-cta-double">
      {topAccessory ? <div className="tds-bottom-cta-top">{topAccessory}</div> : null}
      <div className="tds-bottom-cta-actions">
        <div>{left}</div>
        <div>{right}</div>
      </div>
    </div>
  );
}

export function TdsCard({ children }: CardProps): JSX.Element {
  return <article className="tds-card">{children}</article>;
}
