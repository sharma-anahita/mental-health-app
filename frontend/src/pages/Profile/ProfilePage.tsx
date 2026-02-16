import React from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { PageTitle, SubtleText, CardTitle } from "../../components/ui/Typography";

const ProfilePage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-pink-100 flex items-center justify-center text-indigo-700 font-semibold text-2xl shadow">U</div>
          <div>
            <PageTitle className="text-2xl">Your Name</PageTitle>
            <SubtleText>Member since 2024</SubtleText>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost">Edit</Button>
          <Button variant="primary">Save</Button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-4 flex flex-col gap-6">
          <Card header={<CardTitle>XP Badge</CardTitle>} className="p-4">
            <div className="flex items-center gap-4">
              <Badge variant="calm" className="w-14 h-14 inline-flex items-center justify-center text-lg">12</Badge>
              <div>
                <div className="text-sm text-slate-500">Level</div>
                <div className="text-lg font-semibold">12</div>
              </div>
            </div>
          </Card>

          <Card header={<CardTitle>Streak</CardTitle>} className="p-4">
            <div>
              <div className="text-2xl font-bold text-slate-800">5 days</div>
              <div className="text-sm text-slate-500 mt-1">Keep the momentum going</div>
            </div>
          </Card>
        </aside>

        <main className="col-span-12 md:col-span-8 flex flex-col gap-6">
          <Card header={<div className="text-sm font-semibold">Preferences</div>} className="p-6">
            <div className="space-y-4 text-sm text-slate-600">
              <div>
                <div className="font-medium">Notifications</div>
                <div className="text-slate-500">Email and in-app notifications are enabled.</div>
              </div>
              <div>
                <div className="font-medium">Theme</div>
                <div className="text-slate-500">Pastel / Calm (default)</div>
              </div>
              <div>
                <div className="font-medium">Data Export</div>
                <div className="text-slate-500">Export your mood data as CSV (placeholder)</div>
              </div>
            </div>
          </Card>

          <Card header={<div className="text-sm font-semibold">Account</div>} className="p-6">
            <div className="text-sm text-slate-600">Email: user@example.com</div>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost">Logout</Button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
