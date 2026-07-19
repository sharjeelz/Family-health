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
    urdu: "پس بےشک ہر مشکل کے ساتھ آسانی ہے۔",
    ref: "الشرح 94:5",
  },
  {
    arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    urdu: "اللہ کسی جان پر اس کی طاقت سے بڑھ کر بوجھ نہیں ڈالتا۔",
    ref: "البقرہ 2:286",
  },
  {
    arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    urdu: "اور جو اللہ پر بھروسہ کرے تو وہ اُس کے لیے کافی ہے۔",
    ref: "الطلاق 65:3",
  },
  {
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    urdu: "خبردار! اللہ کے ذکر ہی سے دلوں کو اطمینان نصیب ہوتا ہے۔",
    ref: "الرعد 13:28",
  },
  {
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    urdu: "پس تم مجھے یاد کرو، میں تمہیں یاد رکھوں گا، اور میرا شکر ادا کرو اور میری ناشکری نہ کرو۔",
    ref: "البقرہ 2:152",
  },
  {
    arabic: "لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ",
    urdu: "اللہ کی رحمت سے مایوس نہ ہو۔",
    ref: "الزمر 39:53",
  },
  {
    arabic: "وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ",
    urdu: "اور نہ سستی کرو اور نہ غم کرو، تم ہی غالب رہو گے اگر تم مومن ہو۔",
    ref: "آل عمران 3:139",
  },
  {
    arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    urdu: "بے شک اللہ صبر کرنے والوں کے ساتھ ہے۔",
    ref: "البقرہ 2:153",
  },
  {
    arabic: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
    urdu: "اگر تم شکر کرو گے تو میں تمہیں اور زیادہ عطا کروں گا۔",
    ref: "ابراہیم 14:7",
  },
  {
    arabic: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ",
    urdu: "اور عنقریب تمہارا رب تمہیں اتنا دے گا کہ تم خوش ہو جاؤ گے۔",
    ref: "الضحیٰ 93:5",
  },
  {
    arabic: "وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا",
    urdu: "اور جو لوگ ہماری راہ میں کوشش کرتے ہیں، ہم ضرور انہیں اپنے راستے دکھا دیتے ہیں۔",
    ref: "العنکبوت 29:69",
  },
  {
    arabic: "فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ",
    urdu: "پھر جب تم پختہ ارادہ کر لو تو اللہ پر بھروسہ کرو۔",
    ref: "آل عمران 3:159",
  },
  {
    arabic: "رَّبِّ زِدْنِي عِلْمًا",
    urdu: "اے میرے رب! میرے علم میں اضافہ فرما۔",
    ref: "طٰہٰ 20:114",
  },
  {
    arabic: "إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ",
    urdu: "بے شک اللہ نیکی کرنے والوں کو پسند کرتا ہے۔",
    ref: "البقرہ 2:195",
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
