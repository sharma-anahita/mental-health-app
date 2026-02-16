import React from "react";

type BaseProps = React.PropsWithChildren<{ className?: string }>;

export const PageTitle: React.FC<BaseProps> = ({ children, className = "" }) => (
  <h1 className={`text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-2 ${className}`}>{children}</h1>
);

export const SectionTitle: React.FC<BaseProps> = ({ children, className = "" }) => (
  <h2 className={`text-xl md:text-2xl font-semibold text-slate-900 mb-1 ${className}`}>{children}</h2>
);

export const CardTitle: React.FC<BaseProps> = ({ children, className = "" }) => (
  <div className={`text-sm font-semibold text-slate-900 ${className}`}>{children}</div>
);

export const BodyText: React.FC<BaseProps> = ({ children, className = "" }) => (
  <p className={`text-base text-slate-700 leading-relaxed ${className}`}>{children}</p>
);

export const SubtleText: React.FC<BaseProps> = ({ children, className = "" }) => (
  <span className={`text-sm text-slate-500 ${className}`}>{children}</span>
);

export default {
  PageTitle,
  SectionTitle,
  CardTitle,
  BodyText,
  SubtleText,
};
