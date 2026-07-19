// Curated, meaningful ayat (verses) for the "Ayah of the day".
// These are hand-picked verses about hope, patience, gratitude, reliance on
// Allah and seeking knowledge — not random. The verse shown is chosen
// deterministically from the calendar day, so it stays the same all day and
// rotates gently through the list over time.
//
// Translations follow the Saheeh International rendering. References are given
// so they can be confirmed in a mushaf.

export const AYAT = [
  {
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "For indeed, with hardship [will be] ease.",
    ref: "Ash-Sharh 94:5",
  },
  {
    arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    translation: "Allah does not burden a soul beyond that it can bear.",
    ref: "Al-Baqarah 2:286",
  },
  {
    arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    translation: "And whoever relies upon Allah — then He is sufficient for him.",
    ref: "At-Talaq 65:3",
  },
  {
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    translation: "Unquestionably, by the remembrance of Allah hearts are assured.",
    ref: "Ar-Ra'd 13:28",
  },
  {
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    translation: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
    ref: "Al-Baqarah 2:152",
  },
  {
    arabic: "لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ",
    translation: "Do not despair of the mercy of Allah.",
    ref: "Az-Zumar 39:53",
  },
  {
    arabic: "وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ",
    translation: "So do not weaken and do not grieve, and you will be superior if you are [true] believers.",
    ref: "Aal 'Imran 3:139",
  },
  {
    arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    translation: "Indeed, Allah is with the patient.",
    ref: "Al-Baqarah 2:153",
  },
  {
    arabic: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
    translation: "If you are grateful, I will surely increase you [in favor].",
    ref: "Ibrahim 14:7",
  },
  {
    arabic: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ",
    translation: "And your Lord is going to give you, and you will be satisfied.",
    ref: "Ad-Duha 93:5",
  },
  {
    arabic: "وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا",
    translation: "And those who strive for Us — We will surely guide them to Our ways.",
    ref: "Al-'Ankabut 29:69",
  },
  {
    arabic: "فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ",
    translation: "And when you have decided, then rely upon Allah.",
    ref: "Aal 'Imran 3:159",
  },
  {
    arabic: "رَّبِّ زِدْنِي عِلْمًا",
    translation: "My Lord, increase me in knowledge.",
    ref: "Ta-Ha 20:114",
  },
  {
    arabic: "إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ",
    translation: "Indeed, Allah loves the doers of good.",
    ref: "Al-Baqarah 2:195",
  },
];

// Deterministic "verse of the day": same all day, rotates by calendar day.
export function ayahOfDay(date = new Date()) {
  const dayNumber = Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())) / 86400000
  );
  const idx = ((dayNumber % AYAT.length) + AYAT.length) % AYAT.length;
  return AYAT[idx];
}
