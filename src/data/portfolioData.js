import { karyaCategories, karyaData } from './karyaData';

export const portfolioData = {
  // Informasi Profil Template Baru
  personal: {
    name: "Refaldi Kurniawan",
    firstName: "Refaldi",
    lastName: "Kurniawan",
    nameLine1: "PORTOFOLIO",
    nameLine2: "KREATIF",
    role: "Digital Creative Specialist & Visual Creator",
    tagline: "Video Editing • Visual Design • Social Media Branding",
    aboutHeading: "ABOUT ME",
    aboutDescription:
      "Selamat datang di portofolio kreatif saya! Saya berfokus pada editing video dinamis, motion graphic, dan desain visual kreatif. Silakan sesuaikan deskripsi ini melalui Secret Admin Panel (Ctrl + Shift + B).",
    location: "",
    whatsapp: "",
    whatsappUrl: "",
    instagramAccounts: [],
    youtubeUrl: "",
    tiktokUrl: "",
  },

  // Elemen Dekoratif Hero
  heroDecorations: {
    dreamText: "DREAM",
    quote1: "KEEP LIFE\nWhEn YoU\ndreaming",
    quote2: "fun things\nare fun!",
  },

  // Bagian Skill & Keahlian
  skills: [
    {
      name: "Video Editing & Post-Production",
      category: "Video",
      desc: "Editing video dinamis, pemotongan ritmis, color grading, sound design, dan motion effect.",
      tools: ["CapCut", "Adobe Premiere Pro", "DaVinci Resolve"],
    },
    {
      name: "Desain Visual & Pop-Art Graphic",
      category: "Design",
      desc: "Desain grafis bertema pop-art, poster tipografi, thumbnail YouTube, dan digital imaging.",
      tools: ["Photoshop", "Illustrator", "Canva"],
    },
    {
      name: "Branding & Konten Media Sosial",
      category: "Social Media",
      desc: "Perancangan template feed Instagram, visual banner, dan strategi konsistensi identitas merek.",
      tools: ["Figma", "Canva", "Photoshop"],
    },
    {
      name: "Penerjemahan Bahasa (ID - EN)",
      category: "Language",
      desc: "Penerjemahan dasar dokumen, subtitling video Indonesia–Inggris, dan komunikasi bilingual.",
      tools: ["Subtitle Tools", "Bilingual Proofreading"],
    },
    {
      name: "Otodidak & Adaptasi Software",
      category: "Soft Skill",
      desc: "Cepat mempelajari tools baru secara mandiri dan mengikuti tren kreatif digital terkini.",
      tools: ["Self-Learning", "Creative Workflow"],
    },
    {
      name: "Manajemen Jasa & Komisi Mandiri",
      category: "Service",
      desc: "Pengalaman menerima pesanan komisi desain & editing video dengan komunikasi yang responsif.",
      tools: ["Client Communication", "Project Delivery"],
    },
  ],

  // Bagian Galeri Karya / Portofolio
  karyaCategories,
  karya: karyaData,

  // Bagian Kontak
  contact: {
    badge: "HUBUNGI SAYA",
    title: "Tertarik Berkolaborasi atau Ingin Memesan Jasa?",
    subtitle: "Pintu komunikasi selalu terbuka untuk tawaran proyek kreatif, kolaborasi visual, atau sekadar berdiskusi.",
    whatsappMessage: "Halo! Saya melihat portofolio Anda dan tertarik untuk berdiskusi/memesan jasa.",
  },
};
