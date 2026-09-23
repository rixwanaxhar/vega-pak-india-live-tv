exports.getStream = async function ({ link, providerContext }) {
  const c = JSON.parse(decodeURIComponent(link));
  const url = c.url || link;
  const lower = url.toLowerCase();
  const type = lower.includes(".m3u8") || lower.includes("m3u8") ? "m3u8" : "mp4";
  return [{
    server: "IPTV-org",
    link: url,
    type,
    quality: "Auto"
  }];
};
