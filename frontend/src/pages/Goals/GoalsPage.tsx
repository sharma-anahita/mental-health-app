import React from "react";
import { PageTitle, SubtleText } from "../../components/ui/Typography";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import PageTransition from "../../components/ui/PageTransition";
import { Flag } from "lucide-react";

const GoalsPage: React.FC = () => {
  return (
    <PageTransition className="max-w-7xl mx-auto px-8 py-10">
      <header className="mb-8">
        <PageTitle>Goals</PageTitle>
        <SubtleText>Small, achievable goals to support your wellbeing</SubtleText>
      </header>

      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full text-center p-8">
          {/* Soft icon */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-indigo-50 flex items-center justify-center">
              <Flag className="w-8 h-8 text-indigo-400" />
            </div>
          </div>

          {/* Message */}
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            Goals are coming soon
          </h2>
          <p className="text-slate-600 text-sm mb-6">
            Start with mood tracking and reflections — goal setting will be here to help you grow at your own pace.
          </p>

          {/* Action */}
          <Button variant="primary" onClick={() => window.location.href = '/mood-log'}>
            Log a Mood
          </Button>
        </Card>
      </div>
    </PageTransition>
  );
};

export default GoalsPage;
