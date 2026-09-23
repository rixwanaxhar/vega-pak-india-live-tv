const PK = "https://iptv-org.github.io/iptv/countries/pk.m3u";
const IN = "https://iptv-org.github.io/iptv/countries/in.m3u";

function parseM3U(text, country) {
  const lines = text.split(/\r?\n/);
  const out = [];
  let info = null;
  for (const line of lines) {
    const s = line.trim();
    if (!s) continue;
    if (s.startsWith("#EXTINF:")) {
      const comma = s.indexOf(",");
      const attrs = comma >= 0 ? s.slice(0, comma) : s;
      const title = comma >= 0 ? s.slice(comma + 1).trim() : "Unknown";
      const get = (name) => {
        const m = attrs.match(new RegExp(name + '="([^"]*)"', "i"));
        return m ? m[1] : "";
      };
      info = {
        title,
        logo: get("tvg-logo"),
        id: get("tvg-id"),
        group: get("group-title"),
        lang: get("tvg-language"),
        country
      };
    } else if (!s.startsWith("#") && info) {
      if (/^https?:\/\//i.test(s)) {
        out.push({ ...info, url: s });
      }
      info = null;
    }
  }
  return out;
}

async function getChannels(providerContext) {
  const { axios } = providerContext;
  const [pk, ind] = await Promise.all([
    axios.get(PK, { responseType: "text", timeout: 20000 }),
    axios.get(IN, { responseType: "text", timeout: 20000 })
  ]);
  return [
    ...parseM3U(String(pk.data), "pk"),
    ...parseM3U(String(ind.data), "in")
  ];
}

function encode(c) {
  return encodeURIComponent(JSON.stringify(c));
}

function makePosts(channels) {
  return channels.map((c) => ({
    title: c.title,
    link: encode(c),
    image: c.logo || "",
    tag: c.group || (c.country === "pk" ? "Pakistan" : "India"),
    cornerTag: c.lang || (c.country === "pk" ? "PK" : "IN"),
    aspectRatio: 1.5
  }));
}

exports.getPosts = async function ({ filter, providerContext }) {
  const channels = await getChannels(providerContext);
  const filtered = filter === "pk" || filter === "in"
    ? channels.filter(c => c.country === filter)
    : channels;
  return makePosts(filtered);
};

exports.getSearchPosts = async function ({ searchQuery, providerContext }) {
  const q = String(searchQuery || "").trim().toLowerCase();
  if (!q) return [];
  const channels = await getChannels(providerContext);
  return makePosts(channels.filter(c =>
    c.title.toLowerCase().includes(q) ||
    (c.group || "").toLowerCase().includes(q) ||
    (c.lang || "").toLowerCase().includes(q)
  ));
};
