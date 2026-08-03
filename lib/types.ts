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
export const VIDEO_SLOTS = 3;

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
