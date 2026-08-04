"use client";

import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Bookmark,
  Check,
  ChevronRight,
  Download,
  FileText,
  Globe2,
  Headphones,
  HeartPulse,
  Image as ImageIcon,
  LayoutDashboard,
  Lock,
  Menu,
  Moon,
  Pause,
  Play,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type PlatformKey = "IPN" | "IGC" | "IFR" | "ISR";

type Episode = {
  platform: PlatformKey | "Z";
  title: string;
  description: string;
  audioUrl: string;
  image: string;
  pubDate: string;
};

const platforms: Record<PlatformKey, {
  name: string;
  promise: string;
  tone: string;
  categories: string[];
  services: string[];
  rss: string;
  socials: string[];
}> = {
  IPN: {
    name: "International Public Network",
    promise: "For Planet, People, Progress & Policies.",
    tone: "from-sky-500/20 via-cyan-400/10 to-slate-950/5",
    categories: ["World", "Politics & Governance", "Business & Economy", "Society", "Environment & Climate", "Law & Justice", "Science & Technology", "Health", "Education", "Security & Defence", "Culture & Lifestyle", "Sports"],
    services: ["Advertising", "API Access", "Events", "Journalism Live Online/Offline Workshops", "Memberships", "Merchandise", "Public Affairs Consulting", "Research Reports"],
    rss: "https://anchor.fm/s/1154f5ab8/podcast/rss",
    socials: ["Website", "YouTube", "Spotify", "Apple Podcasts", "Instagram", "Facebook", "LinkedIn", "X", "WhatsApp Community", "WhatsApp Channel", "Contact"],
  },
  IGC: {
    name: "Inspire Guide Connect",
    promise: "Career, motivation, productivity and leadership growth.",
    tone: "from-amber-400/25 via-orange-300/10 to-stone-950/5",
    categories: ["Career Development", "Motivation", "Leadership & Growth Mindset", "Productivity & Time Management", "Business & Entrepreneurship", "Communication & Public Speaking Skills", "Environmental Sustainability"],
    services: ["Management Consulting", "Career & Employability Live Online/Offline Workshops", "Productivity & Time Management Live Online/Offline Workshops", "Books", "Memberships", "Patrons & Donations"],
    rss: "https://anchor.fm/s/109d1667c/podcast/rss",
    socials: ["Website", "YouTube", "Spotify", "Apple Podcasts", "Instagram", "Facebook", "LinkedIn", "X", "Students Community", "Professionals Community", "Corporate Community", "WhatsApp Contact"],
  },
  IFR: {
    name: "Integrity Finance Research",
    promise: "Ethical finance, markets, literacy and economic research.",
    tone: "from-emerald-500/20 via-teal-300/10 to-zinc-950/5",
    categories: ["Ethical Finance", "Ethical Banking", "Shariah Governance", "Economics", "Indian Economy", "Global Economy", "Industry Analysis", "Company Research", "Financial Markets", "Public Policy", "Financial Literacy"],
    services: ["Research Reports", "Books", "Memberships", "Financial Literacy Live Online/Offline Workshops", "Patrons & Donations"],
    rss: "https://anchor.fm/s/e7ad1b40/podcast/rss",
    socials: ["Website", "YouTube", "Spotify", "Apple Podcasts", "Instagram", "Facebook", "LinkedIn", "X", "Author Books", "Research Projects", "WhatsApp Contact"],
  },
  ISR: {
    name: "Ideological Studies Research",
    promise: "Quran, Hadith, theology, ethics and contemporary issues.",
    tone: "from-rose-500/20 via-stone-300/10 to-black/5",
    categories: ["Quranic Studies (6,236 Verses)", "Tafsir Ibn Kathir (6,236 Verses)", "Hadith Studies (68,061 Hadiths)", "Sahih Bukhari (7,563 Hadiths)", "Sahih Muslim (7,563 Hadiths)", "Sunan Abu Dawud (5,274 Hadiths)", "Jami at Tirmidhi (3,956 Hadiths)", "Sunan an Nasai (5,758 Hadiths)", "Sunan Ibn Majah (4,341 Hadiths)", "Al Muwatta by Imam Malik (1,861 Hadiths)", "Musnad Ahmad ibn Hanbal (28,199 Hadiths)", "Sunan ad Darimi (3,546 Hadiths)", "Creed and Theology", "Theological Jurisprudence", "Theological History", "Theological Ethics", "Science and Theology", "Feminism and Theology", "Terrorism and Theology", "Relationships and Theology", "Prophetic and Companion Biographies", "Contemporary Theological Issues"],
    services: ["Research Reports", "Books", "Memberships", "Theological Live Online/Offline Workshops", "Patrons and Donations"],
    rss: "https://anchor.fm/s/f49f1ccc/podcast/rss",
    socials: ["Website", "YouTube", "Spotify", "Apple Podcasts", "Instagram", "Facebook", "LinkedIn", "X", "Microsoft Teams", "WhatsApp Contact"],
  },
};

const plans = [
  ["Monthly", "₹99", "Flexible", "Just ₹3.30/day."],
  ["1 Year", "₹799", "Popular", "Only ₹66.58/month. Recommended for regular learners."],
  ["3 Years", "₹2,199", "Value", "Just ₹61.08/month for uninterrupted access."],
  ["5 Years", "₹3,499", "Savings", "Only ₹58.32/month with long-term savings."],
  ["7 Years", "₹4,699", "Commitment", "Just ₹55.94/month for committed members."],
  ["9 Years", "₹5,799", "Legacy", "Only ₹53.69/month, best long-term value."],
];

const nav = ["Home", "Gate Feed", "Search", "Membership", "Dashboard", "Z Web App"];
const contentTypes = ["All", "Books", "Infographics", "Podcasts", "Research Reports"];
const contentLibrary = [
  { platform: "IPN", type: "Books", title: "World Policy Handbook", category: "World", tags: ["World", "Global", "Politics"], description: "A premium book entry connected to the World category and global public affairs tags." },
  { platform: "IPN", type: "Books", title: "Climate, Society and Progress", category: "Environment & Climate", tags: ["World", "Climate", "Policy"], description: "Book metadata appears when users filter Books with the World tag." },
  { platform: "IGC", type: "Books", title: "Global Productivity Playbook", category: "Productivity & Time Management", tags: ["World", "Productivity", "Leadership"], description: "Cross-platform discovery keeps the selected tag active beyond one hub." },
  { platform: "IFR", type: "Books", title: "World Economy and Ethical Finance", category: "Global Economy", tags: ["World", "Finance", "Economy"], description: "IFR books can surface beside IPN and IGC when tags match." },
  { platform: "ISR", type: "Books", title: "Theology in a Connected World", category: "Contemporary Theological Issues", tags: ["World", "Theology", "Society"], description: "ISR books remain discoverable through the unified Gate tag system." },
  { platform: "IPN", type: "Research Reports", title: "World Governance Outlook", category: "Politics & Governance", tags: ["World", "Governance"], description: "Research reports stay separate unless the user selects the matching content type." },
  { platform: "IFR", type: "Podcasts", title: "Global Markets Briefing", category: "Financial Markets", tags: ["World", "Markets"], description: "Podcast cards are indexed by platform, category and tags." },
  { platform: "IGC", type: "Infographics", title: "World Skills Map", category: "Career Development", tags: ["World", "Career"], description: "Infographic posts use the same metadata and recommendation graph." },
] as const;
const globalTags = ["World", "Global", "Politics", "Climate", "Productivity", "Leadership", "Finance", "Economy", "Theology", "Society", "Governance", "Markets", "Career"];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2" aria-label=".Gate">
      <span className="gate-dot heartbeat" />
      <span className={`${compact ? "text-2xl" : "text-4xl"} gate-wordmark`}>Gate</span>
    </div>
  );
}

function PlatformLogo({ id }: { id: PlatformKey | "Z" }) {
  return (
    <div className="flex items-end gap-2">
      <span className="font-serif text-5xl font-black tracking-tight text-zinc-950 dark:text-white">{id}</span>
      <span className="mb-1 flex items-center gap-1 font-serif text-xl font-bold"><span className="size-2 rounded-full bg-current" />Gate</span>
    </div>
  );
}

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [active, setActive] = useState<PlatformKey>("IPN");
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [playing, setPlaying] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up" | "forgot">("sign-in");
  const [userName, setUserName] = useState("Zayd");
  const [signedIn, setSignedIn] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [selectedType, setSelectedType] = useState("Books");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState("World");
  const audioRef = useRef<HTMLAudioElement>(null);
  const featured = useMemo(() => episodes.find((item) => item.platform === active) ?? episodes[0], [active, episodes]);
  const filteredContent = useMemo(() => contentLibrary.filter((item) => {
    const typeMatch = selectedType === "All" || item.type === selectedType;
    const categoryMatch = selectedCategory === "All" || item.category === selectedCategory;
    const tagMatch = selectedTag === "All" || (item.tags as readonly string[]).includes(selectedTag);
    return typeMatch && categoryMatch && tagMatch;
  }), [selectedType, selectedCategory, selectedTag]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    fetch("/api/podcasts")
      .then((res) => res.json())
      .then((data: { episodes?: Episode[] }) => setEpisodes(data.episodes ?? []))
      .catch(() => setEpisodes([]));
  }, []);

  useEffect(() => {
    const playBeat = () => {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 74;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.24, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    };
    window.addEventListener("pointerdown", playBeat, { once: true });
    return () => window.removeEventListener("pointerdown", playBeat);
  }, []);

  const toggleAudio = async () => {
    if (!audioRef.current || !featured?.audioUrl) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }
    await audioRef.current.play();
    setPlaying(true);
  };

  const openAuth = (mode: "sign-in" | "sign-up" | "forgot" = "sign-in") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const submitAuth = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || form.get("email") || "Member").split("@")[0];
    setUserName(name.charAt(0).toUpperCase() + name.slice(1));
    setSignedIn(true);
    setAuthOpen(false);
    setShowWelcome(true);
    window.setTimeout(() => setShowWelcome(false), 4200);
    window.location.hash = "dashboard";
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f0e8] text-zinc-950 transition-colors duration-500 dark:bg-[#090908] dark:text-[#f6f0e5]">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(195,142,71,.25),transparent_28%),radial-gradient(circle_at_80%_5%,rgba(50,92,88,.18),transparent_30%),linear-gradient(120deg,rgba(255,255,255,.65),transparent)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(195,142,71,.16),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(87,116,112,.18),transparent_30%)]" />
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f4f0e8]/80 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#090908]/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <a href="#home"><Logo compact /></a>
          <nav className="hidden items-center gap-1 rounded-full border border-black/10 bg-white/55 p-1 text-sm dark:border-white/10 dark:bg-white/5 lg:flex">
            {nav.map((item) => <a className="rounded-full px-4 py-2 text-zinc-700 transition hover:bg-black hover:text-white dark:text-zinc-200 dark:hover:bg-white dark:hover:text-black" href={`#${item.toLowerCase().replaceAll(" ", "-")}`} key={item}>{item}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full border border-black/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/10" aria-label="Toggle theme">{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>
            {signedIn ? (
              <button onClick={() => setSignedIn(false)} className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-black">Sign Out</button>
            ) : (
              <button onClick={() => openAuth("sign-in")} className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-black">Sign In</button>
            )}
            <Menu className="lg:hidden" />
          </div>
        </div>
      </header>

      <section id="home" className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
        <div className="flex flex-col justify-center">
          <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white/65 px-4 py-2 text-sm font-medium dark:border-white/10 dark:bg-white/10"><Sparkles size={16} /> Gate. Learn. Discover. Grow.</div>
          <div className="mb-6"><Logo /></div>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[.95] tracking-[-0.05em] md:text-7xl">One premium knowledge ecosystem for IPN, IGC, IFR and ISR.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700 dark:text-zinc-300">A production-ready PWA blueprint combining discovery, learning, publishing, membership, podcast RSS automation, secure admin CMS, SEO/AEO operations and cross-platform access in one unified Gate experience.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => openAuth("sign-up")} className="rounded-full bg-zinc-950 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-black/10 dark:bg-white dark:text-black">Become a Member</button>
            <a className="rounded-full border border-black/15 bg-white/60 px-6 py-4 text-sm font-bold dark:border-white/15 dark:bg-white/10" href="#gate-feed">Explore Gate Feed</a>
          </div>
        </div>
        <div className="rounded-[2.5rem] border border-black/10 bg-white/55 p-4 shadow-2xl shadow-black/10 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="grid gap-4 sm:grid-cols-2">
            {(Object.keys(platforms) as PlatformKey[]).map((id) => (
              <button key={id} onClick={() => { setActive(id); setSelectedCategory("All"); }} className={`group min-h-56 rounded-[2rem] border p-5 text-left transition hover:-translate-y-1 ${active === id ? "border-black bg-white shadow-xl dark:border-white dark:bg-white/10" : "border-black/10 bg-white/45 dark:border-white/10 dark:bg-black/20"}`}>
                <PlatformLogo id={id} />
                <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">{platforms[id].name}</p>
                <p className="mt-2 text-lg font-semibold">{platforms[id].promise}</p>
                <ChevronRight className="mt-6 transition group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className={`rounded-[2.5rem] bg-gradient-to-br ${platforms[active].tone} border border-black/10 p-6 dark:border-white/10 md:p-10`}>
          <div className="flex flex-col justify-between gap-8 lg:flex-row">
            <div>
              <PlatformLogo id={active} />
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">{platforms[active].name}</h2>
              <div className="mt-5 flex flex-wrap gap-2">{contentTypes.map((type) => <button onClick={() => setSelectedType(type)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedType === type ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-black" : "border-black/10 bg-white/55 dark:border-white/10 dark:bg-black/20"}`} key={type}>{type}</button>)}</div>
            </div>
            <div className="max-w-2xl">
              <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-zinc-500">Categories</h3>
              <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => setSelectedCategory("All")} className={`rounded-full px-3 py-2 text-xs font-semibold ${selectedCategory === "All" ? "bg-zinc-950 text-white dark:bg-white dark:text-black" : "bg-white/60 dark:bg-black/20"}`}>All</button>{platforms[active].categories.map((cat) => <button onClick={() => setSelectedCategory(cat)} className={`rounded-full px-3 py-2 text-xs font-semibold ${selectedCategory === cat ? "bg-zinc-950 text-white dark:bg-white dark:text-black" : "bg-white/60 dark:bg-black/20"}`} key={cat}>{cat}</button>)}</div>
            </div>
          </div>
          <div className="mt-8 rounded-[2rem] border border-black/10 bg-white/60 p-5 dark:border-white/10 dark:bg-black/20">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h3 className="text-2xl font-semibold">Unified category and tag results</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Example: select Books and the World tag to show all matching books across IPN, IGC, IFR and ISR below.</p>
              </div>
              <div className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-black">{filteredContent.length} results</div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {["All", ...globalTags].map((tag) => <button onClick={() => setSelectedTag(tag)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedTag === tag ? "border-[#9a6d35] bg-[#9a6d35] text-white" : "border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/10"}`} key={tag}>#{tag}</button>)}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {filteredContent.map((item, index) => <article key={`${item.platform}-${item.title}`} className="rounded-[1.5rem] border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/30"><div className="flex items-start justify-between gap-3"><span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-black">{String(index + 1).padStart(2, "0")} {item.type.slice(0, -1)}</span><span className="text-sm font-bold text-[#9a6d35]">{item.platform}</span></div><h4 className="mt-5 text-xl font-semibold">{item.title}</h4><p className="mt-2 text-sm text-zinc-500">{item.category}</p><p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.description}</p><div className="mt-4 flex flex-wrap gap-2">{item.tags.map((tag) => <button onClick={() => setSelectedTag(tag)} className="rounded-full bg-black/5 px-2 py-1 text-xs font-semibold dark:bg-white/10" key={tag}>#{tag}</button>)}</div></article>)}
            </div>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <FeedCard number="01 Book" icon={<BookOpen />} title="Professional book cards" text="16:25 covers, title, author, 10,000-character descriptions, samples, purchase links and Gate Reader." />
            <FeedCard number="01 Podcast" icon={<Headphones />} title="Live RSS podcast playback" text="Actual RSS audio, full player, mini player, queue, speed, sleep timer, downloads and Media Session support." />
            <FeedCard number="01 Infographic" icon={<ImageIcon />} title="Social infographic feed" text="Fixed 4:5 publishing, captions, tags, full-screen view, view count, share and bookmark only." />
          </div>
        </div>
      </section>

      <section id="gate-feed" className="mx-auto max-w-7xl px-4 py-14">
        <SectionTitle eyebrow="Post Login Experience" title="Algorithm-based Gate Feed" text="After login, the home experience shows the four platform hubs, the standalone Z promotion and a personalised feed ordered as books, research reports, podcasts and infographics." />
        <div className="mt-8 space-y-8">
          <Carousel title="Books" icon={<BookOpen />} ratio="aspect-[16/25]" />
          <Carousel title="Research Reports" icon={<FileText />} ratio="aspect-[16/25]" />
          <div className="rounded-[2rem] border border-black/10 bg-white/55 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="mb-4 flex items-center justify-between"><h3 className="flex items-center gap-2 text-xl font-semibold"><Headphones /> Podcasts</h3><span className="text-sm text-zinc-500">RSS synced</span></div>
            <div className="grid gap-4 md:grid-cols-3">
              {(episodes.length ? episodes.slice(0, 3) : [{ title: "Live RSS episodes load from IPN, IGC, IFR and ISR", platform: active, description: "No placeholder audio is used.", audioUrl: "", image: "", pubDate: "" } as Episode]).map((episode, index) => (
                <article key={`${episode.title}-${index}`} className="rounded-[1.5rem] border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black/30">
                  <div className="aspect-square rounded-[1.2rem] bg-gradient-to-br from-zinc-900 to-zinc-500 p-4 text-white"><span className="text-xs font-bold">{String(index + 1).padStart(2, "0")} Podcast</span><p className="mt-8 line-clamp-4 text-lg font-semibold">{episode.title}</p></div>
                  <p className="mt-3 text-sm text-zinc-500">{episode.platform}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-[1fr_.75fr]">
            <article className="rounded-[2rem] border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="aspect-[4/5] rounded-[1.6rem] bg-[linear-gradient(135deg,#111,#a68453)] p-6 text-white"><span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">01 Infographic</span><h3 className="mt-24 max-w-sm text-4xl font-semibold tracking-tight">Premium 4:5 knowledge card for immersive reading.</h3></div>
              <h3 className="mt-5 text-2xl font-semibold">Expandable captions, tags and focused reading</h3>
              <p className="mt-2 text-zinc-600 dark:text-zinc-300">Infographics use a vertical social feed inspired by Instagram, Pinterest, LinkedIn and FinShots, with no likes, comments, reactions or followers.</p>
            </article>
            <aside className="rounded-[2rem] border border-black/10 bg-white/55 p-6 dark:border-white/10 dark:bg-white/5">
              <h3 className="text-xl font-semibold">Recommendation Signals</h3>
              <div className="mt-4 grid gap-3">{["Searches", "Views", "Saves", "Shares", "Reading time", "Completed content", "Followed categories", "Membership access"].map((item) => <div className="flex items-center justify-between rounded-2xl bg-black/5 p-3 dark:bg-white/10" key={item}><span>{item}</span><Check size={18} /></div>)}</div>
            </aside>
          </div>
        </div>
      </section>

      <section id="search" className="mx-auto max-w-7xl px-4 py-14">
        <SectionTitle eyebrow="Discovery" title="Global search, categories, tags, regions and topics" text="The search layer indexes platform, content type, title, descriptions, metadata, authors, categories, tags, regions and topics for instant cross-ecosystem retrieval." />
        <div className="mt-8 rounded-[2rem] border border-black/10 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-3 rounded-full border border-black/10 bg-white px-5 py-4 dark:border-white/10 dark:bg-black/30"><Search /><span className="text-zinc-500">Search ethical finance podcasts, climate reports, Quranic studies, productivity books...</span></div>
          <div className="mt-5 flex flex-wrap gap-2">{["Platform", "Category", "Content Type", "Tags", "Region", "Topic", "Date", "Popularity"].map((f) => <span className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black" key={f}>{f}</span>)}</div>
        </div>
      </section>

      <section id="membership" className="mx-auto max-w-7xl px-4 py-14">
        <SectionTitle eyebrow="Gate Membership Pricing" title="One subscription unlocks IPN, IGC, IFR and ISR" text="All plans include identical premium benefits; only duration and savings differ. Live exchange rates localise prices before secure checkout." />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map(([name, price, label, detail]) => <div key={name} className={`rounded-[2rem] border p-6 ${name === "1 Year" ? "border-zinc-950 bg-zinc-950 text-white shadow-2xl shadow-black/20 dark:border-white" : "border-black/10 bg-white/65 dark:border-white/10 dark:bg-white/5"}`}><div className="flex items-center justify-between"><h3 className="text-2xl font-semibold">{name}</h3><span className="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">{label}</span></div><p className="mt-6 text-4xl font-bold">{price}</p><p className="mt-3 text-sm opacity-75">{detail}</p><button className={`mt-6 w-full rounded-full px-5 py-3 font-bold ${name === "1 Year" ? "bg-white text-black" : "bg-zinc-950 text-white dark:bg-white dark:text-black"}`}>Choose Plan</button></div>)}
        </div>
      </section>

      <section id="dashboard" className="mx-auto max-w-7xl px-4 py-14">
        <SectionTitle eyebrow="User Account" title="Dashboard, progress, profile and premium access states" text="Guests see previews and premium overlays; logged-in users manage accounts; active members unlock everything; expired members retain metadata while access locks." />
        <div className="mt-8 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-black/10 bg-white/65 p-6 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-4"><div className="grid size-16 place-items-center rounded-full bg-zinc-950 text-white"><User /></div><div><h3 className="text-2xl font-semibold">Greetings, {signedIn ? userName : "Guest"}</h3><p className="text-sm text-zinc-500">{signedIn ? "Active Gate Member" : "Sign in to activate your dashboard"}</p></div></div>
            <div className="mt-6 grid gap-3">{["Profile Photo", "Name", "Bio", "Interests", "Membership", "Reading History", "Listening History", "Downloads", "Bookmarks", "Recently Viewed", "Progress Timeline", "Activity Calendar"].map((item) => <div className="flex justify-between rounded-2xl bg-black/5 p-3 dark:bg-white/10" key={item}><span>{item}</span><Check size={18} /></div>)}</div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Metric title="Reading Hours" value="42" icon={<BookOpen />} />
            <Metric title="Listening Hours" value="18" icon={<Headphones />} />
            <Metric title="Completion Rate" value="76%" icon={<Activity />} />
            <Metric title="Learning Streak" value="21 days" icon={<HeartPulse />} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionTitle eyebrow="Premium Lock UX" title="Smooth member conversion without interruptions" text="Locked premium content uses a bottom-to-top gradient overlay with blur, visible content preview, login and membership actions." />
        <div className="relative mt-8 overflow-hidden rounded-[2rem] border border-black/10 bg-white/65 p-6 dark:border-white/10 dark:bg-white/5">
          <h3 className="max-w-2xl text-3xl font-semibold">Research Report: Global ethical finance outlook and policy pathways</h3>
          <p className="mt-4 max-w-3xl text-zinc-600 dark:text-zinc-300">This premium report preview remains readable enough to understand value while the protected section is secured behind membership access...</p>
          {!signedIn && <div className="absolute inset-x-0 bottom-0 rounded-t-[2rem] bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent p-8 pt-28 text-white backdrop-blur-sm"><Lock /><h4 className="mt-3 text-2xl font-semibold">Unlock with Gate Membership</h4><p className="mt-2 text-white/75">Premium books, podcasts, reports, downloads, certificates, workshops and communities.</p><div className="mt-5 flex gap-3"><button onClick={() => openAuth("sign-in")} className="rounded-full bg-white px-5 py-3 font-bold text-black">Log In</button><button onClick={() => openAuth("sign-up")} className="rounded-full border border-white/30 px-5 py-3 font-bold">Become a Member</button></div></div>}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionTitle eyebrow="Podcast Player" title="Full-screen playback, mini-player and real RSS audio" text="The app fetches RSS episodes through /api/podcasts and connects the audio enclosure URL directly to the in-app player." />
        <div className="mt-8 rounded-[2.5rem] border border-black/10 bg-[#18140f] p-5 text-white shadow-2xl dark:border-white/10 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
            <div className="aspect-square rounded-[2rem] bg-gradient-to-br from-[#d5a85c] to-[#31261b] p-6"><Headphones size={48} /><p className="mt-24 text-2xl font-semibold">{featured?.platform ?? active} Podcast</p></div>
            <div className="flex flex-col justify-center">
              <p className="text-sm uppercase tracking-[0.25em] text-white/50">Now Playing</p>
              <h3 className="mt-3 text-3xl font-semibold md:text-5xl">{featured?.title ?? "Loading live RSS episode"}</h3>
              <p className="mt-4 line-clamp-3 text-white/65">{featured?.description?.replace(/<[^>]*>/g, "") ?? "RSS sync is loading the latest IPN, IGC, IFR and ISR episodes."}</p>
              <audio ref={audioRef} src={featured?.audioUrl} onEnded={() => setPlaying(false)} preload="metadata" />
              <div className="mt-8 flex flex-wrap items-center gap-3"><button onClick={toggleAudio} className="grid size-16 place-items-center rounded-full bg-white text-black" aria-label="Play podcast">{playing ? <Pause /> : <Play />}</button>{["-30", "+10", "1x", "Queue", "Sleep", "Download", "Share"].map((item) => <button className="rounded-full bg-white/10 px-4 py-3 text-sm font-semibold" key={item}>{item}</button>)}</div>
            </div>
          </div>
        </div>
      </section>

      <section id="z-web-app" className="mx-auto max-w-7xl px-4 py-14">
        <div className="rounded-[2.5rem] border border-black/10 bg-white/65 p-8 dark:border-white/10 dark:bg-white/5 md:p-12">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div><PlatformLogo id="Z" /><h2 className="mt-5 text-4xl font-semibold tracking-tight">Z | ZAYDH Productivity & Automation Web App</h2><p className="mt-4 max-w-2xl text-zinc-600 dark:text-zinc-300">Standalone promotional page only. Z remains separate from Gate navigation hierarchy, membership and content ecosystem while listing its RSS podcast promotion.</p></div>
            <a href="https://www.zaydh.com" target="_blank" rel="noopener noreferrer" className="rounded-full bg-zinc-950 px-7 py-4 text-center font-bold text-white dark:bg-white dark:text-black">Open Z Web App</a>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/10 px-4 py-10 dark:border-white/10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 md:flex-row"><Logo compact /><p className="text-sm text-zinc-500">Facebook · Instagram · LinkedIn · X · Gate. Learn. Discover. Grow.</p></div></footer>
      {showWelcome && <div className="fixed right-4 top-24 z-[70] flex items-center gap-3 rounded-3xl border border-black/10 bg-white/95 p-4 shadow-2xl shadow-black/15 animate-in fade-in slide-in-from-top-3 dark:border-white/10 dark:bg-zinc-950/95"><Logo compact /><span className="font-semibold">Greetings, {userName}</span></div>}
      {authOpen && <AuthDialog mode={authMode} setMode={setAuthMode} onClose={() => setAuthOpen(false)} onSubmit={submitAuth} />}
    </main>
  );
}

function AuthDialog({ mode, setMode, onClose, onSubmit }: { mode: "sign-in" | "sign-up" | "forgot"; setMode: (mode: "sign-in" | "sign-up" | "forgot") => void; onClose: () => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  const title = mode === "sign-in" ? "Sign in to .Gate" : mode === "sign-up" ? "Create your Gate account" : "Reset your password";
  const button = mode === "forgot" ? "Send Reset Link" : mode === "sign-up" ? "Create Account" : "Sign In";
  return <div className="fixed inset-0 z-[80] grid place-items-center bg-black/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true"><form onSubmit={onSubmit} className="w-full max-w-md rounded-[2rem] border border-black/10 bg-[#f4f0e8] p-6 shadow-2xl dark:border-white/10 dark:bg-[#11100e]"><div className="flex items-center justify-between"><Logo compact /><button type="button" onClick={onClose} className="rounded-full border border-black/10 px-3 py-1 text-sm dark:border-white/10">Close</button></div><h2 className="mt-8 text-3xl font-semibold tracking-tight">{title}</h2><p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">This prototype signs you in locally and routes you to the correct dashboard. Production auth can connect to Better Auth, email verification, 2FA and social login.</p>{mode === "sign-up" && <label className="mt-6 block text-sm font-semibold">Name<input name="name" required className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-black/30" placeholder="Zayd Haji" /></label>}<label className="mt-4 block text-sm font-semibold">Email<input name="email" type="email" required className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-black/30" placeholder="you@example.com" /></label>{mode !== "forgot" && <label className="mt-4 block text-sm font-semibold">Password<input name="password" type="password" required className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-black/30" placeholder="Enter password" /></label>}<button className="mt-6 w-full rounded-full bg-zinc-950 px-5 py-4 font-bold text-white dark:bg-white dark:text-black">{button}</button><div className="mt-5 flex flex-wrap justify-center gap-3 text-sm"><button type="button" onClick={() => setMode("sign-in")} className="font-semibold">Sign In</button><button type="button" onClick={() => setMode("sign-up")} className="font-semibold">Sign Up</button><button type="button" onClick={() => setMode("forgot")} className="font-semibold">Forgot Password</button></div></form></div>;
}

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div><p className="text-sm font-bold uppercase tracking-[0.25em] text-[#9a6d35]">{eyebrow}</p><h2 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.04em] md:text-6xl">{title}</h2><p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-650 text-zinc-700 dark:text-zinc-300">{text}</p></div>;
}

function FeedCard({ number, icon, title, text }: { number: string; icon: React.ReactNode; title: string; text: string }) {
  return <article className="relative rounded-[2rem] border border-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-black/25"><span className="absolute right-5 top-5 rounded-full bg-zinc-950 px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-black">{number}</span><div className="text-[#9a6d35]">{icon}</div><h3 className="mt-8 text-2xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{text}</p><div className="mt-5 flex gap-3 text-sm"><span className="flex items-center gap-1"><BarChart3 size={16} /> View Count</span><span>Share</span><span className="flex items-center gap-1"><Bookmark size={16} /> Bookmark</span></div></article>;
}

function Carousel({ title, icon, ratio }: { title: string; icon: React.ReactNode; ratio: string }) {
  return <div className="rounded-[2rem] border border-black/10 bg-white/55 p-5 dark:border-white/10 dark:bg-white/5"><div className="mb-4 flex items-center justify-between"><h3 className="flex items-center gap-2 text-xl font-semibold">{icon} {title}</h3><span className="text-sm text-zinc-500">Horizontal slider</span></div><div className="grid grid-cols-2 gap-4 md:grid-cols-4">{[1, 2, 3, 4].map((n) => <article key={n} className="rounded-[1.5rem] border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-black/30"><div className={`${ratio} rounded-[1.1rem] bg-gradient-to-br from-zinc-900 via-[#80623b] to-[#e4d6bc] p-3 text-white`}><span className="rounded-full bg-white/20 px-2 py-1 text-xs font-bold">{String(n).padStart(2, "0")} {title.slice(0, -1)}</span></div><h4 className="mt-3 font-semibold">Gate premium {title.toLowerCase()} title</h4><p className="mt-1 text-sm text-zinc-500">Author · Read More</p></article>)}</div></div>;
}

function Metric({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return <div className="rounded-[2rem] border border-black/10 bg-white/65 p-6 dark:border-white/10 dark:bg-white/5"><div className="text-[#9a6d35]">{icon}</div><p className="mt-8 text-sm text-zinc-500">{title}</p><p className="mt-2 text-4xl font-bold tracking-tight">{value}</p></div>;
}

function Spec({ title, items }: { title: string; items: string[] }) {
  return <div className="rounded-[2rem] border border-black/10 bg-white/65 p-6 dark:border-white/10 dark:bg-white/5"><h3 className="text-xl font-semibold">{title}</h3><div className="mt-4 space-y-3">{items.map((item) => <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300" key={item}><Check size={16} className="text-[#9a6d35]" />{item}</div>)}</div></div>;
}
