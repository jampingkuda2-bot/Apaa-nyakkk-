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

  return merged;
}
