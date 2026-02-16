import React from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { CardTitle, BodyText, SubtleText } from "../ui/Typography";

type InsightType = "positive" | "neutral" | "warning";

interface InsightCardProps {
  title: string;
  description: string;
  type?: InsightType;
  className?: string;
}

const typeMap: Record<InsightType, { variant: Parameters<typeof Badge>[0]['variant']; label: string }> = {
  positive: { variant: "success", label: "Helpful" },
  neutral: { variant: "calm", label: "Note" },
  warning: { variant: "warning", label: "Caution" },
};

/**
 * InsightCard — small reusable card for presenting an insight.
 * - Calm supportive tone suitable for ML-generated observations
 * - Uses `Card`, `Badge`, and `Typography` primitives
 */
export default function InsightCard({ title, description, type = "neutral", className = "" }: InsightCardProps) {
  const badge = typeMap[type] ?? typeMap.neutral;

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Badge variant={badge.variant} title={badge.label}>
            {badge.label}
          </Badge>
        </div>

        <div className="flex-1">
          <CardTitle>{title}</CardTitle>
          <BodyText className="mt-1">{description}</BodyText>
          <div className="mt-2">
            <SubtleText>Shown as a calm suggestion — use what feels right for you.</SubtleText>
          </div>
        </div>
      </div>
    </Card>
  );
}
