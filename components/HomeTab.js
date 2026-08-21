"use client";

// import FamilyPhoto from "./FamilyPhoto";   // carousel paused — see below
import AyahCard from "./AyahCard";
import QuoteCard from "./QuoteCard";
import TodayGlance from "./TodayGlance";
import NextPrayerCard from "./NextPrayerCard";
import DaylightAndOccasion from "./DaylightAndOccasion";
import DuaCards from "./DuaCards";
// import AcCard from "./AcCard";   // AC widget paused — see below

// The dashboard proper. The rail stays deliberately spare — clock, weather,
// nav — and everything worth reading lives out here.
export default function HomeTab() {
  // Each block arrives just after the one above it.
  const step = (i) => ({ animationDelay: `${i * 70}ms` });

  return (
    <div className="space-y-5">
      {/* Photo carousel paused for now — kept so we can bring it back.
      <FamilyPhoto />
      */}

      {/* Prayer, daylight and the next occasion — three across on a wall tablet */}
      <div className="grid gap-5 wall:grid-cols-3 stagger">
        <NextPrayerCard />
        <DaylightAndOccasion />
      </div>

      {/* AC widget paused until there is a LAN helper to talk to. Uncomment
          the import above and swap the block below back in to restore it —
          it sat in a third with the glance panel taking the rest.
      <div className="grid gap-5 wall:grid-cols-3">
        <AcCard />
        <div className="wall:col-span-2">
          <TodayGlance />
        </div>
      </div>
      */}

      <div className="rise-in" style={step(3)}>
        <TodayGlance />
      </div>

      {/* The going-out and coming-in duas, side by side */}
      <div className="grid gap-5 wall:grid-cols-2 stagger">
        <DuaCards />
      </div>

      <div className="rise-in" style={step(6)}>
        <AyahCard />
      </div>
      <div className="rise-in" style={step(7)}>
        <QuoteCard />
      </div>
    </div>
  );
}
