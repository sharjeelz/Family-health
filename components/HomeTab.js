"use client";

// import FamilyPhoto from "./FamilyPhoto";   // carousel paused — see below
import AyahCard from "./AyahCard";
import QuoteCard from "./QuoteCard";

// The fridge's ambient landing screen: the curated ayah of the day paired with
// the daily Urdu message, stacked one above the other.
export default function HomeTab() {
  return (
    <div className="space-y-5">
      {/* Photo carousel paused for now — kept so we can bring it back.
      <FamilyPhoto />
      */}
      <AyahCard />
      <QuoteCard />
    </div>
  );
}
