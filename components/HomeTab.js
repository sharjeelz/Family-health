"use client";

import FamilyPhoto from "./FamilyPhoto";
import AyahCard from "./AyahCard";

// The fridge's ambient landing screen: a rotating family photo and the
// curated ayah of the day. (The daily Urdu message lives in the hero.)
export default function HomeTab() {
  return (
    <div className="space-y-5">
      <FamilyPhoto />
      <AyahCard />
    </div>
  );
}
