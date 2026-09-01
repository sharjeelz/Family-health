"use client";

// import FamilyPhoto from "./FamilyPhoto";   // carousel paused — see below
import DailyWordCard from "./DailyWordCard";
import TodayGlance from "./TodayGlance";
import NextPrayerCard from "./NextPrayerCard";
import DaylightAndOccasion from "./DaylightAndOccasion";
import SectionTitle from "./SectionTitle";
import AcPanel from "./AcPanel";
import BirthdaysCard from "./BirthdaysCard";

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

      {/* One card per air conditioner, with the glance panel and birthdays
          alongside. Birthdays used to span the full width below, which left it
          alone on a second row with two empty columns beside it. */}
      <SectionTitle className="pt-1">Home &amp; family</SectionTitle>
      <div className="grid gap-5 wall:grid-cols-3 rise-in" style={step(3)}>
        <AcPanel />
        <TodayGlance />
        {/* Renders nothing until birthdays are filled in (lib/birthdays.js). */}
        <BirthdaysCard />
      </div>
    </div>
  );
}
