// Common surahs for the Deen tab's Qur'an player.
//
// AUDIO FILES: drop an MP3 for each surah into `public/surahs/` named by its
// `id` below, e.g. public/surahs/al-fatihah.mp3, public/surahs/yasin.mp3.
// A surah with no file yet simply shows "audio not added".

export const SURAHS = [
  { id: "al-fatihah", num: 1, arabic: "الفاتحة", name: "Al-Fatihah", meaning: "The Opening", ayahs: 7 },
  { id: "yasin", num: 36, arabic: "يٰسٓ", name: "Ya-Sin", meaning: "Heart of the Qur'an", ayahs: 83 },
  { id: "ar-rahman", num: 55, arabic: "الرحمٰن", name: "Ar-Rahman", meaning: "The Most Merciful", ayahs: 78 },
  { id: "al-waqiah", num: 56, arabic: "الواقعة", name: "Al-Waqi'ah", meaning: "The Inevitable", ayahs: 96 },
  { id: "al-mulk", num: 67, arabic: "الملك", name: "Al-Mulk", meaning: "The Sovereignty", ayahs: 30 },
  { id: "al-kahf", num: 18, arabic: "الكهف", name: "Al-Kahf", meaning: "The Cave (Fridays)", ayahs: 110 },
  { id: "al-ikhlas", num: 112, arabic: "الإخلاص", name: "Al-Ikhlas", meaning: "Sincerity", ayahs: 4 },
  { id: "al-falaq", num: 113, arabic: "الفلق", name: "Al-Falaq", meaning: "The Daybreak", ayahs: 5 },
  { id: "an-nas", num: 114, arabic: "الناس", name: "An-Nas", meaning: "Mankind", ayahs: 6 },
];

export const surahSrc = (s) => `/surahs/${s.id}.mp3`;
