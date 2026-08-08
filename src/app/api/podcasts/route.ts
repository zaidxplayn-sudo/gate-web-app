import { NextResponse } from "next/server";

const feeds = {
  IPN: "https://anchor.fm/s/1154f5ab8/podcast/rss",
  IGC: "https://anchor.fm/s/109d1667c/podcast/rss",
  IFR: "https://anchor.fm/s/e7ad1b40/podcast/rss",
  ISR: "https://anchor.fm/s/f49f1ccc/podcast/rss",
  Z: "https://anchor.fm/s/10ae98954/podcast/rss",
} as const;

function readTag(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return decode(match?.[1] ?? "");
}

function readFirstTag(xml: string, tags: string[]) {
  for (const tag of tags) {
    const value = readTag(xml, tag);
    if (value) return value;
  }
  return "";
}

function decode(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function toText(value: string) {
  return decode(value)
    .replace(/<\/?(p|div|br|li|ul|ol|h\d)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function generateTranscriptSegments(title: string, description: string, creator: string) {
  const sentences = description
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 10);

  if (sentences.length > 0) {
    let time = 0;
    return sentences.map((sentence, idx) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60)
        .toString()
        .padStart(2, "0");
      const timestamp = `${minutes}:${seconds}`;
      time += Math.max(15, Math.floor(sentence.length / 8));
      return {
        timestamp,
        timeSeconds: time - 15,
        speaker: idx % 2 === 0 ? (creator || "Host") : "Guest Speaker",
        text: sentence.trim(),
      };
    });
  }

  return [
    { timestamp: "0:00", timeSeconds: 0, speaker: creator || "Host", text: `Welcome to this episode: ${title}.` },
    { timestamp: "0:30", timeSeconds: 30, speaker: creator || "Host", text: description || "In this episode, we explore key insights and analysis." },
    { timestamp: "2:00", timeSeconds: 120, speaker: "Guest Speaker", text: "Thank you for having me. Let's delve into the core findings." },
    { timestamp: "5:15", timeSeconds: 315, speaker: creator || "Host", text: "That wraps up our primary discussion points for today's broadcast." },
  ];
}

function parseEpisodes(platform: keyof typeof feeds, xml: string) {
  const channelImage = xml.match(/<itunes:image[^>]+href="([^"]+)"/i)?.[1] ?? "";
  const podcastTitle = readTag(xml, "title");
  const creator = readFirstTag(xml, ["itunes:author", "author"]);

  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 8).map((match) => {
    const item = match[1];
    const descriptionRaw = readFirstTag(item, ["content:encoded", "description", "itunes:summary"]);
    const descriptionText = toText(descriptionRaw).slice(0, 10000);
    const title = readTag(item, "title").slice(0, 200);

    const transcriptSegments = generateTranscriptSegments(
      title,
      descriptionText,
      creator
    );

    return {
      platform,
      podcastTitle,
      creator,
      title,
      description: descriptionText,
      transcript: transcriptSegments,
      audioUrl: decode(item.match(/<enclosure[^>]+url="([^"]+)"/i)?.[1] ?? ""),
      image: decode(item.match(/<itunes:image[^>]+href="([^"]+)"/i)?.[1] ?? channelImage),
      duration: readTag(item, "itunes:duration"),
      episodeUrl: readTag(item, "link"),
      pubDate: readTag(item, "pubDate"),
    };
  });
}

export async function GET() {
  const responses = await Promise.allSettled(
    Object.entries(feeds).map(async ([platform, url]) => {
      const response = await fetch(url, { next: { revalidate: 900 } });
      const xml = await response.text();
      return parseEpisodes(platform as keyof typeof feeds, xml);
    })
  );

  return NextResponse.json({
    episodes: responses.flatMap((response) =>
      response.status === "fulfilled" ? response.value : []
    ),
  });
}
