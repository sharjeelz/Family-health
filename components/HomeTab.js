"use client";

// import FamilyPhoto from "./FamilyPhoto";   // carousel paused — see below
import AyahCard from "./AyahCard";
import QuoteCard from "./QuoteCard";
import TodayGlance from "./TodayGlance";
import NextPrayerCard from "./NextPrayerCard";
import DaylightAndOccasion from "./DaylightAndOccasion";

// The dashboard proper. The rail stays deliberately spare — clock, weather,
// nav — and everything worth reading lives out here.
export default function HomeTab() {
  return (
    <div className="space-y-5">
      {/* Photo carousel paused for now — kept so we can bring it back.
      <FamilyPhoto />
      */}

      {/* Prayer, daylight and the next occasion — three across on a wall tablet */}
      <div className="grid gap-5 wall:grid-cols-3">
        <NextPrayerCard />
        <DaylightAndOccasion />
      </div>

      <TodayGlance />
      <AyahCard />
      <QuoteCard />
    </div>
  );
}
