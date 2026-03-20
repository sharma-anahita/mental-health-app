import Card from "../ui/Card";
import Button from "../ui/Button";
import { CardTitle, BodyText, SubtleText } from "../ui/Typography";
import { getDailyPrompt } from "../../utils/moodHelpers";
import useMoodStore from "../../store/moodStore";

interface DailyPromptCardProps {
  className?: string;
  onReflect?: () => void;
  hasReflection?: boolean;
}

export default function DailyPromptCard({ className = "", onReflect, hasReflection = false }: DailyPromptCardProps) {
  const mood = useMoodStore((s) => s.selectedMood);
  const prompt = getDailyPrompt(mood);

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <CardTitle>Today's Prompt</CardTitle>
        </div>

        <div>
          <BodyText className="text-slate-700">{prompt}</BodyText>
        </div>

        <div className="flex items-center justify-between">
          <SubtleText className="text-slate-500">
            {hasReflection ? "You've already reflected today." : 'Prompt tailored to how you feel right now.'}
          </SubtleText>
          <div>
            <Button variant="primary" onClick={onReflect} disabled={hasReflection}>
              {hasReflection ? 'Reflected' : 'Reflect'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
