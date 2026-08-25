// Naats for the Deen tab, alongside the Qur'an player.
//
// AUDIO FILES: drop an MP3 for each naat into `public/naats/` named by its
// `id` below, e.g. public/naats/tajdar-e-haram.mp3. A naat with no file yet
// simply shows "audio not added", so this list can name more than you have.
//
// Edit freely — the ids are only filenames, nothing else depends on them.

export const NAATS = [
  { id: "qaseeda-burda", title: "Qaseeda Burda Shareef", urdu: "قصیدہ بردہ شریف", by: "Traditional" },
  { id: "tajdar-e-haram", title: "Tajdar-e-Haram", urdu: "تاجدارِ حرم", by: "Sabri Brothers" },
  { id: "bhar-do-jholi", title: "Bhar Do Jholi", urdu: "بھر دو جھولی", by: "Traditional" },
  { id: "mustafa-jaan-e-rehmat", title: "Mustafa Jaan-e-Rehmat", urdu: "مصطفیٰ جانِ رحمت", by: "Traditional" },
  { id: "ya-nabi-salam-alayka", title: "Ya Nabi Salam Alayka", urdu: "یا نبی سلام علیک", by: "Traditional" },
  { id: "balaghal-ula", title: "Balaghal Ula Bi Kamalihi", urdu: "بلغ العلیٰ بکمالہ", by: "Traditional" },
  { id: "har-waqt-tasawwur", title: "Har Waqt Tasawwur Mein", urdu: "ہر وقت تصور میں", by: "Traditional" },
  { id: "mera-koi-nahin", title: "Mera Koi Nahin Hai Teray Siwa", urdu: "میرا کوئی نہیں ہے تیرے سوا", by: "Traditional" },
];

export const naatSrc = (n) => `/naats/${n.id}.mp3`;
