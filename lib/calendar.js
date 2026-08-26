// School calendar — from public/School_Calendar_2026_2027_Alijadah_Official_Letterhead.pdf
// (Al Ijadah International School, Riyadh — Academic Year 2026-2027).
// `date` is the ISO start; `end` (optional) marks multi-day events.
//
// Taken from the written KEY DATES, HOLIDAYS and ACTIVITIES tables on the
// official calendar. The month grids also colour-code days, and that colour
// does not survive text extraction — so if a coloured day is not named in
// those tables, it is not here.

export const SCHOOL_EVENTS = [
  // --- Term structure -------------------------------------------------------
  { date: "2026-08-26", title: "First Parents Teacher Conference" },
  { date: "2026-08-30", title: "First Semester begins" },
  { date: "2027-01-17", title: "Second Semester begins" },
  { date: "2027-06-24", title: "AY 2026/2027 ends" },

  // --- Holidays -------------------------------------------------------------
  { date: "2026-09-23", end: "2026-09-26", title: "National Day Holiday" },
  { date: "2026-11-20", end: "2026-11-28", title: "Autumn Break" },
  { date: "2027-01-08", end: "2027-01-16", title: "Mid-Year Break" },
  { date: "2027-02-19", end: "2027-02-22", title: "Foundation Day Holiday" },
  { date: "2027-02-26", end: "2027-03-13", title: "Eid Al-Fitr Holiday" },
  { date: "2027-05-06", end: "2027-05-21", title: "Eid Al-Adha Holiday" },
  { date: "2027-06-24", title: "End-of-Year Break begins" },

  // --- Quizzes and exams ----------------------------------------------------
  { date: "2026-10-04", end: "2026-10-15", title: "Semester Quizzes" },
  { date: "2026-11-08", end: "2026-11-19", title: "Semester Quizzes" },
  { date: "2026-12-27", end: "2026-12-31", title: "Revision and Mid-Year Exams" },
  { date: "2027-01-03", end: "2027-01-07", title: "Mid-Year Exams" },
  { date: "2027-02-14", end: "2027-02-25", title: "Semester Quizzes" },
  { date: "2027-04-11", end: "2027-04-15", title: "Semester Quizzes" },
  { date: "2027-04-18", end: "2027-04-22", title: "Semester Quizzes" },
  { date: "2027-06-06", end: "2027-06-23", title: "Revision and Final Year Exams" },

  // --- Parents' conferences -------------------------------------------------
  { date: "2026-10-22", title: "Second Parents Teacher Conference" },
  { date: "2027-01-28", title: "Third Parents Teacher Conference" },
  { date: "2027-04-29", title: "Fourth Parents Teacher Conference" },

  // --- First semester activities -------------------------------------------
  { date: "2026-09-06", title: "My Future, My Choice" },
  { date: "2026-09-09", title: "Creative Arabic Strokes" },
  { date: "2026-09-10", title: "Launch of Student Elections" },
  { date: "2026-09-10", title: "Fine Motor Station (Kindergarten)" },
  { date: "2026-09-13", title: "Future Fest Innovation" },
  { date: "2026-09-17", title: "English Treasure Hunt" },
  { date: "2026-09-20", title: "Launch of Math Olympics" },
  { date: "2026-09-22", title: "Saudi National Day Celebration" },
  { date: "2026-09-28", title: "Social Studies Discovery Week" },
  { date: "2026-09-28", title: "When Science Comes to Life (Science)" },
  { date: "2026-09-29", end: "2026-09-30", title: "Master Class for Parents (HSE)" },
  { date: "2026-10-01", title: "Children's Day Celebration" },
  { date: "2026-10-08", title: "Little Food Explorers (Kindergarten)" },
  { date: "2026-10-11", end: "2026-10-22", title: "Innovation Week" },
  { date: "2026-10-18", title: "Launch of Little Readers Competition" },
  { date: "2026-10-20", title: "Sports Day" },
  { date: "2026-10-22", title: "Little Readers Ceremony" },
  { date: "2026-10-25", end: "2026-10-28", title: "Trips Week" },
  { date: "2026-10-27", title: "Beyond the Experiment (Science)" },
  { date: "2026-11-01", end: "2026-11-05", title: "MindSpire Cup Round 1" },
  { date: "2026-11-02", title: "Show & Tell Event (English)" },
  { date: "2026-11-03", title: "Speedy Solvers (Math)" },
  { date: "2026-11-05", title: "Arabic Around the World" },
  { date: "2026-11-19", title: "Little Care Club (Kindergarten)" },
  { date: "2026-11-29", title: "Autumn In the Air (Art)" },
  { date: "2026-11-30", title: "Innovation Fair" },
  { date: "2026-12-03", title: "Our World, Our Story (Social Studies)" },
  { date: "2026-12-08", title: "Science Fair" },
  { date: "2026-12-13", end: "2026-12-17", title: "Future Makers Day — Innovation Week" },
  { date: "2026-12-17", title: "Arabic World Day — لغتي هويتي" },
  { date: "2026-12-20", title: "Islamic Week — رسولي قدوتي" },
  { date: "2026-12-24", title: "Carnival Day" },

  // --- Second semester activities ------------------------------------------
  { date: "2027-01-20", title: "Hadith Competition Ceremony — رسولي قدوتي" },
  { date: "2027-01-21", title: "Escape Room (Math)" },
  { date: "2027-01-25", title: "Culture Day (Social Studies)" },
  { date: "2027-01-28", title: "Champions In Action (PE)" },
  { date: "2027-02-01", title: "Charity Campaign" },
  { date: "2027-02-02", title: "Cooking Competition" },
  { date: "2027-02-04", title: "Launch of Quran Competition & Ramadan Celebration" },
  { date: "2027-02-04", title: "The Best Author (English)" },
  { date: "2027-02-10", title: "Colours' Day (Kindergarten)" },
  { date: "2027-02-11", title: "Founding Day Celebration" },
  { date: "2027-02-18", title: "Iftar Ramadan Event (Students)" },
  { date: "2027-02-18", title: "Quran Final Competition & Awards" },
  { date: "2027-02-24", title: "Eid Celebration" },
  { date: "2027-03-14", title: "Think, Play, Create (Kindergarten)" },
  { date: "2027-03-16", title: "The Language Explorer (2nd Language)" },
  { date: "2027-03-18", title: "Mothers' Day Celebration" },
  { date: "2027-03-21", title: "Drama Day (Arabic/English)" },
  { date: "2027-03-25", title: "The Enrichment Hub" },
  { date: "2027-03-29", title: "Creative Minds (Steam)" },
  { date: "2027-04-01", title: "Zootopia (Science)" },
  { date: "2027-04-06", title: "Little Chef (Kindergarten)" },
  { date: "2027-04-08", title: "Feel The Beat (Music)" },
  { date: "2027-04-25", title: "Launch of Nabrah Poetry & Recitation Competition" },
  { date: "2027-04-26", title: "Build It with Math (Math)" },
  { date: "2027-04-29", title: "Graduation Ceremony" },
  { date: "2027-05-06", title: "Steam Fair Awards" },
  { date: "2027-05-25", title: "Nabrah Poetry & Recitation Celebration (Arabic)" },
  // The PDF prints this as 27/5/2026, which cannot be right — it sits between
  // May and June 2027 entries. Read as 2027.
  { date: "2027-05-27", title: "Science Fair" },
];

// Local midnight, not UTC — an event on the 23rd should read as the 23rd here,
// not slip a day either side of the Riyadh offset.
function toDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// What is still to come, soonest first. A multi-day event counts as upcoming
// until its last day has passed, so a half-finished Eid break still shows.
export function upcomingEvents(from = new Date(), limit = 6) {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return SCHOOL_EVENTS.map((e) => ({
    ...e,
    start: toDate(e.date),
    finish: toDate(e.end || e.date),
  }))
    .filter((e) => e.finish >= today)
    .sort((a, b) => a.start - b.start)
    .slice(0, limit);
}
