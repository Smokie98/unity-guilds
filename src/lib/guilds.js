// Guild configuration — all guild data, colors, Discord server IDs, and roles
// This is the single source of truth for guild information across the entire site

export const GUILDS = {
  women: {
    name: "Women's Unity Guild",
    shortName: "Women's Guild",
    slug: "women",
    emoji: "💜",
    tagline: "Empowering women in the Twitch streaming community",
    colors: {
      primary: "#9146FF",
      secondary: "#C084FC",
      accent: "#F472B6",
      primaryRgb: "145,70,255",
      accentRgb: "244,114,182",
      gradient: "linear-gradient(135deg, #9146FF 0%, #C084FC 40%, #F472B6 100%)",
      cardBg: "linear-gradient(145deg, #1a0929 0%, #0d0518 100%)",
      dark: "#0E0517",
      darkCard: "#1A0929",
      border: "rgba(168,85,247,0.2)",
      text: "#F5E6FF",
      text2: "#C4A8D8",
      muted: "#8B6FA0",
      glow: "rgba(145,70,255,0.25)",
      glowHover: "rgba(145,70,255,0.45)",
    },
    discord: {
      serverId: "1068660747997024296",
      roles: [
        "Guild Member",
        "Twitch Staff",
        "Community Specialist",
        "Visiting Guild Community Specialist",
        "Newsletter Team",
        "Mentor: Event/Project Planning",
      ],
    },
  },
  black: {
    name: "The Black Guild",
    shortName: "Black Guild",
    slug: "black",
    emoji: "🖤",
    tagline: "Celebrating and uplifting Black creators on Twitch",
    colors: {
      primary: "#16a34a",
      secondary: "#4ade80",
      accent: "#dc2626",
      primaryRgb: "22,163,74",
      accentRgb: "220,38,38",
      gradient: "linear-gradient(135deg, #16a34a 0%, #4ade80 40%, #dc2626 100%)",
      cardBg: "linear-gradient(145deg, #0a1a0a 0%, #050a05 100%)",
      dark: "#050a05",
      darkCard: "#0a1a0a",
      border: "rgba(22,163,74,0.2)",
      text: "#E6FFE6",
      text2: "#A8D8A8",
      muted: "#6FA06F",
      glow: "rgba(22,163,74,0.2)",
      glowHover: "rgba(220,38,38,0.35)",
    },
    discord: {
      serverId: "1068660581596401694",
      roles: [
        "Guild Member",
        "Twitch Staff",
        "Community Specialist",
        "Visiting Guild Community Specialist",
        "Newsletter Team",
        "Mentor: Event/Project Planning",
      ],
    },
  },
  latin: {
    name: "Latin Guild",
    shortName: "Latin Guild",
    slug: "latin",
    emoji: "🧡",
    tagline: "Amplifying Latin voices and creators on Twitch",
    colors: {
      primary: "#c2410c",
      secondary: "#ea580c",
      accent: "#fbbf24",
      primaryRgb: "194,65,12",
      accentRgb: "251,191,36",
      gradient: "linear-gradient(135deg, #c2410c 0%, #ea580c 40%, #fbbf24 100%)",
      cardBg: "linear-gradient(145deg, #1a0800 0%, #0d0500 100%)",
      dark: "#0d0500",
      darkCard: "#1a0800",
      border: "rgba(234,88,12,0.2)",
      text: "#FFF5E6",
      text2: "#D8C4A8",
      muted: "#A08B6F",
      glow: "rgba(234,88,12,0.25)",
      glowHover: "rgba(234,88,12,0.45)",
    },
    discord: {
      serverId: "1068660653134454874",
      roles: [
        "Guild Member",
        "Twitch Staff",
        "Community Specialist",
        "Visiting Guild Community Specialist",
        "Newsletter Team",
        "Mentor: Event/Project Planning",
      ],
    },
  },
  pride: {
    name: "Pride Guild",
    shortName: "Pride Guild",
    slug: "pride",
    emoji: "🌈",
    tagline: "Celebrating LGBTQ+ creators and community on Twitch",
    colors: {
      primary: "#e879f9",
      secondary: "#a855f7",
      accent: "#60a5fa",
      primaryRgb: "232,121,249",
      accentRgb: "96,165,250",
      gradient: "linear-gradient(90deg, #ef4444, #f97316, #facc15, #4ade80, #60a5fa, #a855f7)",
      cardBg: "linear-gradient(145deg, #0d0d1a 0%, #080810 100%)",
      dark: "#080810",
      darkCard: "#0d0d1a",
      border: "rgba(255,255,255,0.08)",
      text: "#F0E6FF",
      text2: "#C4B8D8",
      muted: "#8B7FA0",
      glow: "rgba(168,85,247,0.2)",
      glowHover: "rgba(168,85,247,0.35)",
    },
    discord: {
      serverId: "1237451084449185975",
      roles: [
        "Guild Member",
        "Twitch Staff",
        "Community Specialist",
        "Visiting Guild Community Specialist",
        "Newsletter Team",
        "Mentor: Event/Project Planning",
      ],
    },
  },
  ia: {
    name: "Indigenous Alliance",
    shortName: "Indigenous Alliance",
    slug: "ia",
    emoji: "🪶",
    tagline: "Supporting Indigenous creators and voices on Twitch",
    colors: {
      primary: "#7c3aed",
      secondary: "#a78bfa",
      accent: "#ffffff",
      primaryRgb: "124,58,237",
      accentRgb: "167,139,250",
      gradient: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 50%, #ffffff 100%)",
      cardBg: "linear-gradient(145deg, #0d0520 0%, #080315 100%)",
      dark: "#080315",
      darkCard: "#0d0520",
      border: "rgba(124,58,237,0.2)",
      text: "#F0E6FF",
      text2: "#C4A8D8",
      muted: "#8B6FA0",
      glow: "rgba(124,58,237,0.25)",
      glowHover: "rgba(124,58,237,0.45)",
    },
    discord: {
      serverId: null, // To be added
      roles: [
        "Guild Member",
        "Twitch Staff",
        "Community Specialist",
        "Visiting Guild Community Specialist",
      ],
    },
  },
};

// Get a guild by its slug
export function getGuild(slug) {
  return GUILDS[slug] || null;
}

// Get all guild slugs (for generating static pages)
export function getAllGuildSlugs() {
  return Object.keys(GUILDS);
}

// Landing page guilds (exclude IA from main grid — it has no newsletter page yet)
export function getLandingGuilds() {
  return ["women", "black", "latin", "pride"];
}

// All guilds that compete in Guildie Games
export function getGameGuilds() {
  return ["women", "black", "latin", "pride", "ia"];
}
