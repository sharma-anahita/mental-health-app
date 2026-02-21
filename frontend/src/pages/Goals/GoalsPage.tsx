import React from "react";
import { PageTitle, SubtleText } from "../../components/ui/Typography";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import PageTransition from "../../components/ui/PageTransition";
import { Flag } from "lucide-react";
import { useEffect, useState } from "react";
import * as goalService from "../../services/goalService";
import useUserStore from "../../store/userStore";
import Input from "../../components/ui/Input";

const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<goalService.GoalPayload[]>([]);
  const [loading, setLoading] = useState(false);
  const [newText, setNewText] = useState('');
  const userStore = useUserStore();

  const load = async () => {
    setLoading(true);
    try {
      const res = await goalService.listGoals();
      setGoals(res.goals || []);
    } catch (err) {
      // ignore for now
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (type: 'daily' | 'weekly') => {
    if (!newText.trim()) return;
    try {
      const res = await goalService.createGoal({ type, text: newText.trim() });
      setGoals((g) => [res.goal, ...g]);
      setNewText('');
    } catch (err) {
      // ignore
    }
  };

  const toggleComplete = async (g: goalService.GoalPayload) => {
    try {
      const res = await goalService.updateGoal(g._id as string, { completed: !g.completed });
      setGoals((list) => list.map((x) => (x._id === g._id ? res.goal : x)));
      if (res.user) {
        userStore.applyProfileUpdate({ level: res.user.level, xp: res.user.xp, coins: res.user.coins, streak: res.user.streak });
      }
    } catch (err) {
      // ignore
    }
  };

  return (
    <PageTransition className="max-w-7xl mx-auto px-8 py-10">
      <header className="mb-6">
        <PageTitle>Goals</PageTitle>
        <SubtleText>Small, achievable goals to support your wellbeing</SubtleText>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-6">
          <Card className="p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                <Flag className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <div className="text-sm font-medium">Create a daily goal</div>
                <SubtleText className="block">A small achievable target for today</SubtleText>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Input value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Write a simple goal" />
              <Button variant="primary" onClick={() => handleCreate('daily')}>Add</Button>
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-3 text-sm font-medium">Your Goals</div>
            {loading ? <div className="text-sm text-slate-600">Loading…</div> : (
              <div className="flex flex-col gap-3">
                {goals.length === 0 && <div className="text-sm text-slate-500">No goals yet — add one above.</div>}
                {goals.map((g) => (
                  <div key={g._id} className="flex items-center justify-between p-3 rounded-md bg-white/50">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={!!g.completed} onChange={() => toggleComplete(g)} />
                      <div>
                        <div className="text-sm font-medium">{g.text}</div>
                        <SubtleText className="text-xs">{g.type} goal</SubtleText>
                      </div>
                    </div>
                    <div>
                      {g.completed && <SubtleText>Completed</SubtleText>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <Card className="p-4">
            <div className="text-sm font-medium mb-2">Weekly Goal</div>
            <Input value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Weekly goal (optional)" />
            <div className="mt-3">
              <Button variant="primary" onClick={() => handleCreate('weekly')}>Add Weekly Goal</Button>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default GoalsPage;
