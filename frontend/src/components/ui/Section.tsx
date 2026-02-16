import React from "react";
import { SectionTitle } from "./Typography";

interface SectionProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export default function Section({ title, children, className = "", compact = false }: SectionProps) {
  const outer = `mb-6 ${className}`;
  const inner = compact ? "mt-2" : "mt-3";

  return (
    <section className={outer}>
      {title && <SectionTitle>{title}</SectionTitle>}
      <div className={inner}>{children}</div>
    </section>
  );
}
