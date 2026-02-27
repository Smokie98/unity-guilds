import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// POST /api/seed — populate all guilds with realistic placeholder data
export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Promote current user to super_admin
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("unity-session");
    if (sessionCookie) {
      const session = JSON.parse(sessionCookie.value);
      if (session.discord_id) {
        await supabase
          .from("users")
          .update({ role: "super_admin" })
          .eq("discord_id", session.discord_id);

        // Update the session cookie to reflect new role
        session.role = "super_admin";
        cookieStore.set("unity-session", JSON.stringify(session), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });
      }
    }
  } catch (e) {
    console.error("Failed to promote user:", e);
  }

  const guilds = ["women", "black", "latin", "pride", "ia"];
  const results = {};

  for (const guild of guilds) {
    results[guild] = {};

    // --- CLEAR EXISTING SEED DATA ---
    await supabase.from("newsletters").delete().eq("guild", guild);
    await supabase.from("events").delete().eq("guild", guild);
    await supabase.from("announcements").delete().eq("guild", guild);
    await supabase.from("spotlight").delete().eq("guild", guild);
    await supabase.from("guild_hall_recaps").delete().eq("guild", guild);
    await supabase.from("highlights").delete().eq("guild", guild);

    // --- NEWSLETTERS ---
    const newsletters = getNewsletters(guild);
    for (const nl of newsletters) {
      await supabase.from("newsletters").insert(nl);
    }
    results[guild].newsletters = newsletters.length;

    // --- EVENTS ---
    const events = getEvents(guild);
    for (const evt of events) {
      await supabase.from("events").insert(evt);
    }
    results[guild].events = events.length;

    // --- ANNOUNCEMENTS ---
    const announcements = getAnnouncements(guild);
    for (const ann of announcements) {
      await supabase.from("announcements").insert(ann);
    }
    results[guild].announcements = announcements.length;

    // --- SPOTLIGHT ---
    const spotlights = getSpotlights(guild);
    for (const sp of spotlights) {
      await supabase.from("spotlight").insert(sp);
    }
    results[guild].spotlights = spotlights.length;

    // --- RECAPS ---
    const recaps = getRecaps(guild);
    for (const r of recaps) {
      await supabase.from("guild_hall_recaps").insert(r);
    }
    results[guild].recaps = recaps.length;

    // --- HIGHLIGHTS ---
    const highlights = getHighlights(guild);
    for (const h of highlights) {
      await supabase.from("highlights").insert(h);
    }
    results[guild].highlights = highlights.length;
  }

  return NextResponse.json({ success: true, results });
}

// ===== DATA GENERATORS =====

const GUILD_NAMES = {
  women: "Women's Unity Guild",
  black: "The Black Guild",
  latin: "Latin Guild",
  pride: "Pride Guild",
  ia: "Indigenous Alliance",
};

const GUILD_EMOJIS = {
  women: "\uD83D\uDC9C",
  black: "\uD83D\uDDA4",
  latin: "\u2764\uFE0F",
  pride: "\uD83C\uDF08",
  ia: "\uD83C\uDF3F",
};

function getNewsletters(guild) {
  const name = GUILD_NAMES[guild];
  return [
    {
      guild,
      title: `${name} — Weekly Digest #3`,
      content: `<h1>Welcome to Issue #3!</h1>
<p>Happy Thursday, ${name} family! This week has been absolutely incredible for our community. From record-breaking stream numbers to heartwarming collaboration moments, there's so much to celebrate.</p>
<h3>Community Highlights</h3>
<ul>
<li>Our community crossed <strong>500 active members</strong> this week!</li>
<li>Three members hit Partner status — congratulations!</li>
<li>The charity stream raised over $2,400 for our chosen cause</li>
</ul>
<h3>Upcoming This Month</h3>
<p>Don't miss our <strong>Guild Hall Meeting</strong> on March 15th where we'll be discussing the Spring content calendar and voting on new community initiatives. Mark your calendars!</p>
<blockquote>
<p>"Together we rise, together we create, together we inspire." — ${name} Motto</p>
</blockquote>
<h3>Creator Spotlight Preview</h3>
<p>Next week's spotlight features an amazing creator who went from 0 to 1,000 followers in just 3 months using community raid trains. Stay tuned!</p>
<p>See you in the streams! ${GUILD_EMOJIS[guild]}</p>`,
      excerpt: `This week: 500 active members milestone, 3 new Partners, charity stream success, and upcoming Guild Hall meeting details.`,
      issue_number: 3,
      published: true,
      published_at: "2026-02-27T12:00:00Z",
    },
    {
      guild,
      title: `${name} — Weekly Digest #2`,
      content: `<h1>Issue #2 — February Momentum</h1>
<p>Welcome back, Guild! February is shaping up to be our best month yet. Let's dive into everything happening.</p>
<h3>Stream Statistics</h3>
<ul>
<li>Total community watch hours: <strong>12,450</strong></li>
<li>Average concurrent viewers across guild: <strong>847</strong></li>
<li>New followers gained collectively: <strong>3,200+</strong></li>
</ul>
<h3>Event Recap: Valentine's Day Stream-a-thon</h3>
<p>What. A. Day. Over 40 guild members participated in our 12-hour Valentine's Day stream marathon. The love and support in every chat was incredible.</p>
<h3>Resources Corner</h3>
<p>Check out the new <strong>Streaming Toolkit</strong> we've published in the Discord resources channel. It includes OBS templates, channel point ideas, and engagement tips curated by our mentors.</p>`,
      excerpt: `February momentum: 12,450 watch hours, Valentine's stream-a-thon recap, and new streaming toolkit resources.`,
      issue_number: 2,
      published: true,
      published_at: "2026-02-20T12:00:00Z",
    },
    {
      guild,
      title: `${name} — Launch Issue #1`,
      content: `<h1>Welcome to Our Newsletter! ${GUILD_EMOJIS[guild]}</h1>
<p>We are thrilled to launch the official ${name} newsletter! This is your weekly source for everything happening in our incredible community.</p>
<h3>What to Expect</h3>
<ul>
<li><strong>Weekly digests</strong> every Thursday</li>
<li><strong>Community spotlights</strong> featuring amazing members</li>
<li><strong>Event announcements</strong> and recaps</li>
<li><strong>Tips and resources</strong> for growing your stream</li>
</ul>
<h3>Our Mission</h3>
<p>The ${name} exists to uplift, connect, and empower our community of creators on Twitch. Together, we're building something special.</p>
<p>Let's make 2026 our best year yet!</p>`,
      excerpt: `Introducing the official ${name} newsletter — your weekly source for community news, spotlights, events, and resources.`,
      issue_number: 1,
      published: true,
      published_at: "2026-02-13T12:00:00Z",
    },
  ];
}

function getEvents(guild) {
  const name = GUILD_NAMES[guild];
  return [
    {
      guild,
      title: `${name} Guild Hall Meeting`,
      event_date: "2026-03-08",
      event_time: "7:00 PM EST",
      location: "Discord Voice Channel",
      description: `Monthly community meeting to discuss upcoming initiatives, vote on proposals, and connect with fellow guild members. All members welcome!`,
    },
    {
      guild,
      title: "Community Game Night",
      event_date: "2026-03-05",
      event_time: "8:00 PM EST",
      location: "Twitch / Discord",
      description: `Join us for a fun evening of games! This month we're playing Among Us and Fall Guys. Prizes for winners!`,
    },
    {
      guild,
      title: "Raid Train Thursday",
      event_date: "2026-03-06",
      event_time: "6:00 PM EST",
      location: "Twitch",
      description: `Our weekly raid train! Support fellow guild streamers as we hop from channel to channel spreading love and follows.`,
    },
    {
      guild,
      title: "Creator Workshop: Overlays & Branding",
      event_date: "2026-03-12",
      event_time: "5:00 PM EST",
      location: "Discord Stage",
      description: `Learn how to create professional stream overlays and build your personal brand. Led by our design mentors.`,
    },
    {
      guild,
      title: "Charity Stream Marathon",
      event_date: "2026-03-15",
      event_time: "12:00 PM EST",
      location: "Twitch",
      description: `12-hour charity stream benefiting our community partner. Sign up for a streaming slot in Discord!`,
    },
    {
      guild,
      title: "New Member Welcome Mixer",
      event_date: "2026-03-01",
      event_time: "7:00 PM EST",
      location: "Discord Voice Channel",
      description: `Welcome our newest guild members! Icebreakers, introductions, and community info session.`,
    },
    {
      guild,
      title: "Mentor Office Hours",
      event_date: "2026-03-10",
      event_time: "4:00 PM EST",
      location: "Discord",
      description: `Drop in for 1-on-1 advice from our mentors on stream growth, content strategy, and community building.`,
    },
    {
      guild,
      title: "Watch Party: Twitch Rivals",
      event_date: "2026-03-20",
      event_time: "3:00 PM EST",
      location: "Discord / Twitch",
      description: `Watch party for the Twitch Rivals tournament! Cheer on our guild members competing.`,
    },
  ];
}

function getAnnouncements(guild) {
  const name = GUILD_NAMES[guild];
  return [
    {
      guild,
      title: "Spring Content Calendar Now Available!",
      content: `The Spring 2026 content calendar has been posted in the Discord resources channel. Check it out for themed streaming days, collaboration opportunities, and community events planned for March through May.`,
      icon: "\uD83D\uDCC5",
      pinned: true,
    },
    {
      guild,
      title: "Congratulations to Our New Partners!",
      content: `Huge shoutout to three guild members who achieved Twitch Partner status this month! Your hard work and dedication inspire us all. Check the Discord for their celebration streams this weekend.`,
      icon: "\uD83C\uDF89",
      pinned: false,
    },
    {
      guild,
      title: "Discord Server Updates",
      content: `We've reorganized the Discord server with new channels including #content-ideas, #collab-requests, and #tech-support. Plus, the new role-based access system is live — make sure to grab your roles!`,
      icon: "\uD83D\uDD27",
      pinned: false,
    },
    {
      guild,
      title: "Guildie Games Month 2 is LIVE!",
      content: `Month 2 of Guildie Games has officially started! This month's challenges focus on community engagement metrics. Submit your clips and stats through the games portal. May the best guild win!`,
      icon: "\uD83C\uDFC6",
      pinned: false,
    },
  ];
}

function getSpotlights(guild) {
  const name = GUILD_NAMES[guild];
  const spotlightData = {
    women: [
      { member_name: "Luna_Streams", member_handle: "@luna_streams", bio: "Luna started streaming cozy games last summer and has built one of the most welcoming communities on Twitch. Her positivity and dedication to uplifting other women in gaming is truly inspiring. In just 8 months, she's grown from 50 to 2,000 followers!", achievement: "Reached Affiliate in record time — 45 days!", featured_week: "Week of Feb 24", is_current: true },
      { member_name: "PixelQueen_GG", member_handle: "@pixelqueengg", bio: "Competitive FPS player and community organizer who runs weekly tournaments for guild members. Her coaching sessions have helped dozens of streamers improve their gameplay.", achievement: "Organized 12 community tournaments", featured_week: "Week of Feb 17", is_current: false },
      { member_name: "CraftyCora", member_handle: "@craftycora", bio: "Creative streamer specializing in art and crafting content. Cora's streams blend creativity with community interaction in the most beautiful way.", achievement: "500 subscriber milestone!", featured_week: "Week of Feb 10", is_current: false },
    ],
    black: [
      { member_name: "KingNova_TV", member_handle: "@kingnova_tv", bio: "KingNova brings energy and authenticity to every stream. His variety content spans from competitive shooters to storytelling RPGs, and his community is one of the most engaged on the platform.", achievement: "10,000 follower milestone!", featured_week: "Week of Feb 24", is_current: true },
      { member_name: "MelaninMagic", member_handle: "@melaninmagic", bio: "Music producer and Just Chatting streamer who creates beats live on stream. Her creative process streams have inspired a wave of musician streamers in the guild.", achievement: "Featured on Twitch Front Page", featured_week: "Week of Feb 17", is_current: false },
      { member_name: "JayPlays_", member_handle: "@jayplays_", bio: "Retro gaming enthusiast who brings nostalgia and joy to every stream. Jay's knowledge of gaming history makes every playthrough an educational experience.", achievement: "Completed 100-game challenge", featured_week: "Week of Feb 10", is_current: false },
    ],
    latin: [
      { member_name: "SolStreamz", member_handle: "@solstreamz", bio: "Bilingual streamer who bridges the English and Spanish Twitch communities. Sol's inclusive streams create a space where everyone feels welcome regardless of language.", achievement: "Bilingual community of 3,000+", featured_week: "Week of Feb 24", is_current: true },
      { member_name: "FuegoGaming", member_handle: "@fuegogaming", bio: "Competitive Valorant player and community coach. Fuego runs free coaching sessions for guild members every Saturday.", achievement: "Reached Immortal rank live on stream", featured_week: "Week of Feb 17", is_current: false },
      { member_name: "MariposaTV", member_handle: "@mariposatv", bio: "IRL and travel streamer showcasing Latin American culture, food, and destinations. Her streams are a virtual passport to incredible places.", achievement: "IRL stream from 15 countries", featured_week: "Week of Feb 10", is_current: false },
    ],
    pride: [
      { member_name: "RainbowRonin", member_handle: "@rainbowronin", bio: "Action RPG speedrunner and LGBTQ+ advocate. Ronin uses their platform to raise awareness and funds for queer youth organizations while delivering incredible gameplay.", achievement: "Raised $5,000 for charity", featured_week: "Week of Feb 24", is_current: true },
      { member_name: "StardustPlays", member_handle: "@stardustplays", bio: "Cozy game streamer creating the safest, most welcoming space on Twitch. Stardust's community moderation approach has become a model for other streamers.", achievement: "Zero-tolerance community award", featured_week: "Week of Feb 17", is_current: false },
      { member_name: "NeonNights_", member_handle: "@neonnights_", bio: "DJ and music streamer who hosts Pride-themed dance parties every Friday night. The vibes are always immaculate.", achievement: "Friday Night Pride — 50 episodes!", featured_week: "Week of Feb 10", is_current: false },
    ],
    ia: [
      { member_name: "SkyWalker_IA", member_handle: "@skywalker_ia", bio: "Educational streamer sharing Indigenous stories, traditions, and perspectives through gaming. SkyWalker's streams are a beautiful blend of culture and entertainment.", achievement: "Indigenous History series — 30 episodes", featured_week: "Week of Feb 24", is_current: true },
      { member_name: "ThunderVoice", member_handle: "@thundervoice", bio: "Variety streamer and community elder who mentors new Indigenous creators on the platform. Their guidance has helped launch dozens of streaming careers.", achievement: "Mentored 25+ new streamers", featured_week: "Week of Feb 17", is_current: false },
      { member_name: "WildSage_GG", member_handle: "@wildsage_gg", bio: "Survival and nature game specialist who incorporates traditional ecological knowledge into gameplay commentary. Every stream is an adventure.", achievement: "Completed every survival game on Twitch", featured_week: "Week of Feb 10", is_current: false },
    ],
  };

  return spotlightData[guild] || spotlightData.women;
}

function getRecaps(guild) {
  const name = GUILD_NAMES[guild];
  return [
    {
      guild,
      title: `February Guild Hall — Planning Spring 2026`,
      summary: `This month's Guild Hall focused on planning our Spring content calendar and community initiatives. We voted on three new monthly events, discussed the Guildie Games standings, and heard from two guest speakers about content strategy. Key decisions: weekly Raid Trains moving to Thursdays, new mentorship pairings announced, and the charity stream target set at $5,000.`,
      meeting_date: "2026-02-15",
      topics: ["Spring Calendar", "Guildie Games", "Raid Trains", "Mentorship", "Charity Goals"],
      content: "Full meeting notes available in Discord.",
    },
    {
      guild,
      title: `January Guild Hall — New Year, New Goals`,
      summary: `We kicked off 2026 with an energetic goal-setting session. Members shared their streaming goals for the year, and we established guild-wide targets including 50 new Affiliates by June and 10 new Partners by December. The community voted to add Guildie Games as a permanent monthly feature.`,
      meeting_date: "2026-01-18",
      topics: ["2026 Goals", "Affiliate Drive", "Guildie Games Launch", "Community Survey Results"],
      content: "Full meeting notes available in Discord.",
    },
  ];
}

function getHighlights(guild) {
  return [
    {
      guild,
      title: "Valentine's Day Stream-a-thon",
      description: "40+ guild members participated in our 12-hour Valentine's streaming marathon. Over $2,400 raised for charity!",
      event_type: "Community Event",
      event_date: "2026-02-14",
      image_url: null,
    },
    {
      guild,
      title: "Raid Train Record Breaker",
      description: "Last week's raid train hit a new record — 28 streamers participated and we collectively gained over 1,200 new followers!",
      event_type: "Raid Train",
      event_date: "2026-02-20",
      image_url: null,
    },
    {
      guild,
      title: "New Partner Celebration",
      description: "Three guild members achieved Twitch Partner this month! We hosted a special celebration stream with shoutouts and community love.",
      event_type: "Milestone",
      event_date: "2026-02-22",
      image_url: null,
    },
    {
      guild,
      title: "Creator Workshop: Stream Setup 101",
      description: "Our mentors hosted a hands-on workshop covering audio setup, lighting, and OBS configuration. Over 60 attendees!",
      event_type: "Workshop",
      event_date: "2026-02-08",
      image_url: null,
    },
  ];
}
