import { karyaCategories, karyaData } from './karyaData';

export const portfolioData = {
  // Informasi Profil Sesuai Permintaan
  personal: {
    name: "Refaldi Kurniawan",
    firstName: "Refaldi",
    lastName: "Kurniawan",
    nameLine1: "REFALDI",
    nameLine2: "KURNIAWAN",
    role: "Digital Creative Specialist & Visual Creator",
    tagline: "Video Editing • Visual Design • Social Media Branding",
    aboutHeading: "ABOUT ME",
    aboutDescription:
      "Memiliki ketertarikan pada bidang kreatif digital seperti editing video, desain visual, branding media sosial, serta penerjemahan dasar Indonesia–Inggris. Terbiasa mempelajari software dan teknik kreatif secara otodidak, serta pernah membuka jasa/komisi mandiri untuk kebutuhan editing dan desain.",
    location: "Indonesia",
    whatsapp: "+6281378825542",
    whatsappUrl: "https://wa.me/6281378825542",
    instagramAccounts: [
      { label: "Akun Utama", handle: "@popchalant.id", url: "https://www.instagram.com/popchalant.id/" },
      { label: "Akun Pribadi", handle: "@refall.burger", url: "https://www.instagram.com/refall.burger/" },
    ],
    youtubeUrl: "https://www.youtube.com/@whoisgonnathingkingabtdiz",
    tiktokUrl: "https://www.tiktok.com/@popchalant",
  },

  // Elemen Dekoratif Hero
  heroDecorations: {
    dreamText: "DREAM",
    quote1: "KEEP LIFE\nWhEn YoU\ndreaming",
    quote2: "fun things\nare fun!",
  },

  // 1. Bagian Video Perkenalan
  videoIntro: {
    badge: "VIDEO PERKENALAN",
    title: "Tonton Video Perkenalan Diri",
    subtitle: "Video singkat yang memperkenalkan diri saya, minat di bidang kreatif digital, dan proses pembuatan karya.",
    videoType: "file",
    videoUrl: "",
    videoFileUrl: "/introvid/intro.mp4",
    highlights: [
      {
        number: "01",
        title: "Video Editing & Storytelling",
        desc: "Penyusunan alur cerita visual dengan ritme dinamis dan efek transisi yang pas.",
      },
      {
        number: "02",
        title: "Desain Visual & Branding",
        desc: "Eksplorasi tata letak, warna pop-art, dan identitas visual yang khas.",
      },
      {
        number: "03",
        title: "Penerjemahan ID-EN",
        desc: "Pemahaman konteks bahasa untuk subtitle dan komunikasi bilingual.",
      },
    ],
  },

  // 2. Bagian Skill & Keahlian
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

  // 3. Bagian Galeri Karya / Portofolio
  karyaCategories,
  karya: karyaData,

  // 4. Bagian Kontak
  contact: {
    badge: "HUBUNGI SAYA",
    title: "Tertarik Berkolaborasi atau Ingin Memesan Jasa?",
    subtitle: "Pintu komunikasi selalu terbuka untuk tawaran proyek video editing, desain visual, komisi kreatif, atau sekadar bertukar ide.",
    whatsappMessage: "Halo Refaldi! Saya melihat portofolio kreatif Anda dan tertarik untuk berdiskusi/memesan jasa.",
  },
};
