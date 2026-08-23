"use client";

// import FamilyPhoto from "./FamilyPhoto";   // carousel paused — see below
import DailyWordCard from "./DailyWordCard";
import TodayGlance from "./TodayGlance";
import NextPrayerCard from "./NextPrayerCard";
import DaylightAndOccasion from "./DaylightAndOccasion";
import SectionTitle from "./SectionTitle";
import AcPanel from "./AcPanel";

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

      <div className="rise-in">
        <DailyWordCard />
      </div>

      {/* Prayer, daylight and the next occasion — three across on a wall tablet */}
      <SectionTitle>Today</SectionTitle>
      <div className="grid gap-5 wall:grid-cols-3 stagger">
        <NextPrayerCard />
        <DaylightAndOccasion />
      </div>

      {/* One card per air conditioner, with the glance panel alongside. */}
      <SectionTitle className="pt-1">Home &amp; family</SectionTitle>
      <div className="grid gap-5 wall:grid-cols-3 rise-in" style={step(3)}>
        <AcPanel />
        <div className="wall:col-span-2">
          <TodayGlance />
        </div>
      </div>
    </div>
  );
}
