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

function parseEpisodes(platform: keyof typeof feeds, xml: string) {
  const channelImage = xml.match(/<itunes:image[^>]+href="([^"]+)"/i)?.[1] ?? "";
  const podcastTitle = readTag(xml, "title");
  const creator = readFirstTag(xml, ["itunes:author", "author"]);
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 8).map((match) => {
    const item = match[1];
    const description = readFirstTag(item, ["content:encoded", "description", "itunes:summary"]);
    return {
      platform,
      podcastTitle,
      creator,
      title: readTag(item, "title").slice(0, 200),
      description: toText(description).slice(0, 10000),
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
    }),
  );

  return NextResponse.json({
    episodes: responses.flatMap((response) => (response.status === "fulfilled" ? response.value : [])),
  });
}
