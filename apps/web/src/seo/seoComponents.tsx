import Link from "next/link";
import type { ReactNode } from "react";
import { FaqItem, FaqJsonLd } from "./faqJsonLd";
import type { InternalLinkCard } from "./internalLinks";

interface SeoPageShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

interface LinkCardGridProps {
  title: string;
  links: InternalLinkCard[];
}

interface FaqSectionProps {
  title?: string;
  items: FaqItem[];
}

interface NameChipListProps {
  title: string;
  names: string[];
}

export function SeoPageShell({
  title,
  description,
  children,
}: SeoPageShellProps): JSX.Element {
  return (
    <main className="seo-shell">
      <article className="seo-panel">
        <header className="seo-header">
          <h1 className="seo-h1">{title}</h1>
          <p className="seo-description">{description}</p>
        </header>
        {children}
      </article>
    </main>
  );
}

export function LinkCardGrid({ title, links }: LinkCardGridProps): JSX.Element {
  return (
    <section className="seo-section">
      <h2 className="seo-h2">{title}</h2>
      <div className="seo-link-grid">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="seo-link-card">
            <h3 className="seo-card-title">{link.title}</h3>
            <p className="seo-card-description">{link.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function NameChipList({ title, names }: NameChipListProps): JSX.Element {
  return (
    <section className="seo-section">
      <h2 className="seo-h2">{title}</h2>
      <ul className="seo-name-chip-list">
        {names.map((name) => (
          <li key={name} className="seo-name-chip">
            {name}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FaqSection({ title = "자주 묻는 질문", items }: FaqSectionProps): JSX.Element {
  return (
    <section className="seo-section">
      <h2 className="seo-h2">{title}</h2>
      <ul className="seo-faq-list">
        {items.map((item) => (
          <li key={item.question} className="seo-faq-item">
            <h3 className="seo-faq-question">{item.question}</h3>
            <p className="seo-faq-answer">{item.answer}</p>
          </li>
        ))}
      </ul>
      <FaqJsonLd items={items} />
    </section>
  );
}

export function ParagraphSection({
  title,
  paragraphs,
}: {
  title: string;
  paragraphs: string[];
}): JSX.Element {
  return (
    <section className="seo-section">
      <h2 className="seo-h2">{title}</h2>
      {paragraphs.map((paragraph, index) => (
        <p key={`${title}-${index}`} className="seo-paragraph">
          {paragraph}
        </p>
      ))}
    </section>
  );
}

export function NoteSection({ text }: { text: string }): JSX.Element {
  return (
    <section className="seo-note">
      <h2 className="seo-h2">참고 및 주의</h2>
      <p className="seo-paragraph">{text}</p>
    </section>
  );
}
