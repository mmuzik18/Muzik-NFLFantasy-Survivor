"use client";

import { Scoreboard } from "@/components/Scoreboard";

export default function ScoreboardPage() {
  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
      <Scoreboard />
    </div>
  );
}
