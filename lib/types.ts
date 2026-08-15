export type StepData = {
  id: string;
  title: string;
  message: string;
  photoUrl: string | null;
};

export type MediaItem = {
  url: string;
  type: "image" | "video";
};

export type Prize = {
  label: string;
  weight: number;
};

export type SoundPack = {
  tapBlip: string | null; // star tap feedback
  chime: string | null; // gate-opening celebration chime
  wheelTick: string | null; // spin wheel ticking
  winJingle: string | null; // spin result / sent-success jingle
  whoosh: string | null; // gallery open sound
};

export const DEFAULT_SOUNDS: SoundPack = {
  tapBlip: null,
  chime: null,
  wheelTick: null,
  winJingle: null,
  whoosh: null,
};

export type SiteTexts = {
  heroEyebrow: string;
  heroButton: string;
  introTeasers: string[];
  popupEyebrow: string;
  popupMessage: string;
  countdownEyebrow: string;
  stepsEyebrow: string;
  stepsHeading: string;
  galleryEyebrow: string;
  galleryHeading: string;
  videoEyebrow: string;
  videoHeading: string;
  photoboothEyebrow: string;
  photoboothHeading: string;
  messageEyebrow: string;
  messageHeading: string;
  sweetWordsEyebrow: string;
  sweetWordsHeading: string;
  sweetWordsList: string[];
  spinEyebrow: string;
  spinHeading: string;
  spinSubheading: string;
  closingLetterLabel: string;
};

export const DEFAULT_TEXTS: SiteTexts = {
  heroEyebrow: "Untuk seseorang di langitku",
  heroButton: "Ayo, buka pelan-pelan ↓",
  introTeasers: [
    "Psstt~ sayaaang...",
    "Sebelooom kamu lanjuttt,",
    "ada sesuatuuu yang udah aku siapin diam-diam loh 👀",
    "tapi ga segampang itu bukanyaaa...",
    "kamu kudu bantuin aku dulu yaaa~",
  ],
  popupEyebrow: "Hari ini spesial",
  popupMessage: "Semoga tahun ini banyak hal baik dateng ke kamu. Masih ada kejutan lain nunggu di bawah.",
  countdownEyebrow: "Menuju hari-H",
  stepsEyebrow: "Perjalanan kita",
  stepsHeading: "Ini semua masih aku inget jelas",
  galleryEyebrow: "Galeri",
  galleryHeading: "Beberapa kenangan lain juga",
  videoEyebrow: "Video",
  videoHeading: "Ini ga cukup kalau cuma difoto",
  photoboothEyebrow: "Balik dong",
  photoboothHeading: "Kirim satu senyum buat aku",
  messageEyebrow: "Atau",
  messageHeading: "Tulis aja balasannya",
  sweetWordsEyebrow: "Bonus",
  sweetWordsHeading: "Butuh disemangatin dikit?",
  sweetWordsList: [
    "Kamu tuh entah kenapa selalu bikin hari yang biasa aja jadi mendingan.",
    "Aku tuh suka banget sama cara kamu ketawa, walau kamu sendiri suka gak sadar.",
    "Semoga kamu selalu dikelilingi orang-orang yang sayang kamu sebanyak aku sayang kamu.",
    "Kadang aku mikir, untung banget ya waktu itu kita ketemu.",
    "Kamu itu capek boleh, nyerah jangan.",
    "Aku gak butuh alasan buat sayang kamu, tapi kalau dipaksa nyari, bakal kepanjangan.",
    "Semoga apapun yang lagi kamu khawatirin, pelan-pelan ketemu jalan keluarnya.",
    "Kamu pantas dapet hal-hal baik, jangan lupain itu.",
    "Aku suka versi kamu yang lagi jadi diri sendiri, bukan yang lagi capek jadi kuat.",
    "Kalau kamu lagi ngerasa kurang, inget aku selalu ngerasa kamu udah lebih dari cukup.",
    "Makasih ya udah bertahan sejauh ini, aku bangga sama kamu.",
    "Semoga tahun ini kamu lebih sering ketawa daripada nahan air mata.",
    "Kamu itu rumah paling nyaman yang pernah aku temuin.",
    "Pelan-pelan aja, gak semua harus buru-buru, aku nungguin kamu.",
  ],
  spinEyebrow: "Buat kamu",
  spinHeading: "Giliran kamu sekarang, puter bintangnya",
  spinSubheading: "Sekali puter, satu kejutan buat kamu.",
  closingLetterLabel: "Sebelum kamu tutup ini",
};

export type SiteConfig = {
  recipientName: string;
  senderName: string;
  openingMessage: string;
  steps: StepData[];
  gallery: (MediaItem | null)[];
  videos: (MediaItem | null)[];
  prizes: Prize[];
  maxSpinsPerIp: number;
  birthdayDate: string; // "MM-DD"
  togetherSinceDate: string | null; // "YYYY-MM-DD" or null to hide the counter
  closingLetter: string;
  sounds: SoundPack;
  texts: SiteTexts;
  sitePassword: string | null;
  appIconUrl: string | null;
  siteTitle: string;
};

export const GALLERY_SLOTS = 10;
export const VIDEO_SLOTS = 10;
export const DEFAULT_MAX_SPINS = 30;

export const DEFAULT_CONFIG: SiteConfig = {
  recipientName: "Angel",
  senderName: "Aku",
  openingMessage:
    "Sebelum kamu buka apapun di sini, tarik napas dulu. Ini cuma buat kamu.",
  steps: [
    {
      id: "step-1",
      title: "Pertemuan pertama kita",
      message:
        "Aku masih ingat waktu itu, semua terasa biasa saja sampai kamu muncul dan tiba-tiba semuanya jadi punya warna. Siapa sangka satu pertemuan bisa mengubah banyak hal.",
      photoUrl: null,
    },
    {
      id: "step-2",
      title: "Momen favorit",
      message:
        "Dari semua momen yang sudah kita lewati, ini salah satu yang paling aku simpan rapi di kepala. Kecil, sederhana, tapi selalu bikin aku senyum sendiri kalau diingat lagi.",
      photoUrl: null,
    },
  ],
  gallery: Array.from({ length: GALLERY_SLOTS }, () => null),
  videos: Array.from({ length: VIDEO_SLOTS }, () => null),
  prizes: [
    { label: "Astralune", weight: 1 },
    { label: "Astrele", weight: 1 },
    { label: "Megalodon", weight: 1 },
    { label: "Dark Megalodon", weight: 1 },
    { label: "Flame Tyran", weight: 1 },
  ],
  maxSpinsPerIp: DEFAULT_MAX_SPINS,
  birthdayDate: "08-18",
  togetherSinceDate: null,
  closingLetter:
    "Kalau kamu baca ini sampai sini, makasih ya udah mau pelan-pelan buka semuanya. Aku nggak selalu jago ngomongin perasaan langsung, jadi mungkin ini cara aku yang agak muter buat bilang: aku sayang kamu, dan aku bersyukur banget ada kamu. Selamat ulang tahun.",
  sounds: { ...DEFAULT_SOUNDS },
  texts: { ...DEFAULT_TEXTS, introTeasers: [...DEFAULT_TEXTS.introTeasers], sweetWordsList: [...DEFAULT_TEXTS.sweetWordsList] },
  sitePassword: null,
  appIconUrl: null,
  siteTitle: "Sebuah Kejutan ✨",
};

// Old saved configs may have fewer gallery/video slots than the current
// GALLERY_SLOTS / VIDEO_SLOTS constants (e.g. if we increase the slot count
// later), or may still have prizes saved as plain strings from before rates
// existed, or may predate newer fields entirely. This pads/migrates them so
// existing saved data always works with the newest shape instead of staying
// stuck at whatever it was first saved with.
export function normalizeConfig(data: Partial<SiteConfig>): SiteConfig {
  const merged: SiteConfig = { ...DEFAULT_CONFIG, ...data };

  const gallery = Array.isArray(data.gallery) ? [...data.gallery] : [];
  while (gallery.length < GALLERY_SLOTS) gallery.push(null);
  merged.gallery = gallery;

  const videos = Array.isArray(data.videos) ? [...data.videos] : [];
  while (videos.length < VIDEO_SLOTS) videos.push(null);
  merged.videos = videos;

  const rawPrizes: unknown[] = Array.isArray(data.prizes) ? data.prizes : [];
  const prizes: Prize[] = rawPrizes.map((p) => {
    if (typeof p === "string") return { label: p, weight: 1 };
    if (p && typeof p === "object") {
      const obj = p as { label?: unknown; weight?: unknown };
      const label = typeof obj.label === "string" && obj.label.trim() ? obj.label : "Hadiah";
      const weight = typeof obj.weight === "number" && obj.weight > 0 ? obj.weight : 1;
      return { label, weight };
    }
    return { label: "Hadiah", weight: 1 };
  });
  merged.prizes = prizes.length > 0 ? prizes : DEFAULT_CONFIG.prizes;

  const rawMax = (data as { maxSpinsPerIp?: unknown }).maxSpinsPerIp;
  merged.maxSpinsPerIp = typeof rawMax === "number" && rawMax > 0 ? rawMax : DEFAULT_MAX_SPINS;

  const rawBirthday = (data as { birthdayDate?: unknown }).birthdayDate;
  merged.birthdayDate =
    typeof rawBirthday === "string" && /^\d{2}-\d{2}$/.test(rawBirthday)
      ? rawBirthday
      : DEFAULT_CONFIG.birthdayDate;

  const rawSince = (data as { togetherSinceDate?: unknown }).togetherSinceDate;
  merged.togetherSinceDate = typeof rawSince === "string" && rawSince.trim() ? rawSince : null;

  const rawLetter = (data as { closingLetter?: unknown }).closingLetter;
  merged.closingLetter =
    typeof rawLetter === "string" && rawLetter.trim() ? rawLetter : DEFAULT_CONFIG.closingLetter;

  const rawSounds = (data as { sounds?: unknown }).sounds;
  const soundsObj = rawSounds && typeof rawSounds === "object" ? (rawSounds as Record<string, unknown>) : {};
  merged.sounds = {
    tapBlip: typeof soundsObj.tapBlip === "string" ? soundsObj.tapBlip : null,
    chime: typeof soundsObj.chime === "string" ? soundsObj.chime : null,
    wheelTick: typeof soundsObj.wheelTick === "string" ? soundsObj.wheelTick : null,
    winJingle: typeof soundsObj.winJingle === "string" ? soundsObj.winJingle : null,
    whoosh: typeof soundsObj.whoosh === "string" ? soundsObj.whoosh : null,
  };

  const rawTexts = (data as { texts?: unknown }).texts;
  const textsObj = rawTexts && typeof rawTexts === "object" ? (rawTexts as Record<string, unknown>) : {};
  const str = (key: keyof SiteTexts): string =>
    typeof textsObj[key] === "string" && (textsObj[key] as string).trim()
      ? (textsObj[key] as string)
      : (DEFAULT_TEXTS[key] as string);

  merged.texts = {
    heroEyebrow: str("heroEyebrow"),
    heroButton: str("heroButton"),
    introTeasers:
      Array.isArray(textsObj.introTeasers) && textsObj.introTeasers.length > 0
        ? (textsObj.introTeasers as string[])
        : [...DEFAULT_TEXTS.introTeasers],
    popupEyebrow: str("popupEyebrow"),
    popupMessage: str("popupMessage"),
    countdownEyebrow: str("countdownEyebrow"),
    stepsEyebrow: str("stepsEyebrow"),
    stepsHeading: str("stepsHeading"),
    galleryEyebrow: str("galleryEyebrow"),
    galleryHeading: str("galleryHeading"),
    videoEyebrow: str("videoEyebrow"),
    videoHeading: str("videoHeading"),
    photoboothEyebrow: str("photoboothEyebrow"),
    photoboothHeading: str("photoboothHeading"),
    messageEyebrow: str("messageEyebrow"),
    messageHeading: str("messageHeading"),
    sweetWordsEyebrow: str("sweetWordsEyebrow"),
    sweetWordsHeading: str("sweetWordsHeading"),
    sweetWordsList:
      Array.isArray(textsObj.sweetWordsList) && textsObj.sweetWordsList.length > 0
        ? (textsObj.sweetWordsList as string[])
        : [...DEFAULT_TEXTS.sweetWordsList],
    spinEyebrow: str("spinEyebrow"),
    spinHeading: str("spinHeading"),
    spinSubheading: str("spinSubheading"),
    closingLetterLabel: str("closingLetterLabel"),
  };

  const rawSitePassword = (data as { sitePassword?: unknown }).sitePassword;
  merged.sitePassword = typeof rawSitePassword === "string" && rawSitePassword.trim() ? rawSitePassword : null;

  const rawIconUrl = (data as { appIconUrl?: unknown }).appIconUrl;
  merged.appIconUrl = typeof rawIconUrl === "string" && rawIconUrl.trim() ? rawIconUrl : null;

  const rawTitle = (data as { siteTitle?: unknown }).siteTitle;
  merged.siteTitle = typeof rawTitle === "string" && rawTitle.trim() ? rawTitle : DEFAULT_CONFIG.siteTitle;

  return merged;
}
