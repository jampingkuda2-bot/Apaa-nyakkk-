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

export type SiteConfig = {
  recipientName: string;
  senderName: string;
  openingMessage: string;
  steps: StepData[];
  gallery: (MediaItem | null)[];
  videos: (MediaItem | null)[];
  prizes: string[];
  spinsAllowed: number;
};

export const GALLERY_SLOTS = 10;
export const VIDEO_SLOTS = 10;

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
  prizes: ["Astralune", "Astrele", "Megalodon", "Dark Megalodon", "Flame Tyran"],
  spinsAllowed: 1,
};

// Old saved configs may have fewer gallery/video slots than the current
// GALLERY_SLOTS / VIDEO_SLOTS constants (e.g. if we increase the slot count
// later). This pads them out so existing saved data always gets the newest
// slot count instead of staying stuck at whatever it was first saved with.
export function normalizeConfig(data: Partial<SiteConfig>): SiteConfig {
  const merged: SiteConfig = { ...DEFAULT_CONFIG, ...data };

  const gallery = Array.isArray(data.gallery) ? [...data.gallery] : [];
  while (gallery.length < GALLERY_SLOTS) gallery.push(null);
  merged.gallery = gallery;

  const videos = Array.isArray(data.videos) ? [...data.videos] : [];
  while (videos.length < VIDEO_SLOTS) videos.push(null);
  merged.videos = videos;

  return merged;
}
