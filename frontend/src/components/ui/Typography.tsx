import React from "react";

type BaseProps = React.PropsWithChildren<{ className?: string }>;

export const PageTitle: React.FC<BaseProps> = ({ children, className = "" }) => (
  <h1 className={`text-3xl md:text-4xl font-extrabold text-[var(--theme-text-primary)] leading-tight mb-2 ${className}`}>{children}</h1>
);

export const SectionTitle: React.FC<BaseProps> = ({ children, className = "" }) => (
  <h2 className={`text-xl md:text-2xl font-semibold text-[var(--theme-text-primary)] mb-1 ${className}`}>{children}</h2>
);

export const CardTitle: React.FC<BaseProps> = ({ children, className = "" }) => (
  <div className={`text-sm font-semibold text-[var(--theme-text-primary)] ${className}`}>{children}</div>
);

export const BodyText: React.FC<BaseProps> = ({ children, className = "" }) => (
  <p className={`text-base text-[var(--theme-text-secondary)] leading-relaxed ${className}`}>{children}</p>
);

export const SubtleText: React.FC<BaseProps> = ({ children, className = "" }) => (
  <span className={`text-sm text-[var(--theme-text-subtle)] ${className}`}>{children}</span>
);

export default {
  PageTitle,
  SectionTitle,
  CardTitle,
  BodyText,
  SubtleText,
};
