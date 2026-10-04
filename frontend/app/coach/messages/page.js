"use client";

import { Suspense } from "react";
import PlayerMessages from "@/app/player/messages/page";

export default function CoachMessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Messages inbox...</div>}>
      <PlayerMessages />
    </Suspense>
  );
}
