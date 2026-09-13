import { karyaCategories, karyaData } from './karyaData';

export const portfolioData = {
  // Informasi Profil Template Baru
  personal: {
    name: "Phebe Fabulla",
    firstName: "Phebe",
    lastName: "Fabulla",
    nameLine1: "PHEBE",
    nameLine2: "FABULLA",
    profilePhoto: "/images/mypibi.png",
    role: "Digital Creative Specialist & Visual Creator",
    tagline: "Video Editing • Visual Design • Social Media Branding",
    aboutHeading: "ABOUT ME",
    aboutDescription:
      "Selamat datang di portofolio kreatif saya! Saya berfokus pada editing video dinamis, motion graphic, dan pembuatan desain visual kreatif berkualitas tinggi untuk berbagai kebutuhan konten digital.",
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

  // Bagian Skill & Keahlian (3 Keahlian Utama)
  skills: [
    {
      name: "Design & Digital Scrapbook",
      category: "Design",
      desc: "Desain visual bertema kreatif, digital scrapbook, poster tipografi, thumbnail, dan digital imaging.",
      tools: ["Photoshop", "Illustrator", "Canva", "ibis Paint"],
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
