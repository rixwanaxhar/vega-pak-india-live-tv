exports.getMeta = async function ({ link }) {
  const c = JSON.parse(decodeURIComponent(link));
  const countryName = c.country === "pk" ? "Pakistan" : "India";
  return {
    title: c.title,
    image: c.logo || "",
    poster: c.logo || "",
    synopsis: `${countryName} live TV channel${c.group ? " • " + c.group : ""}${c.lang ? " • " + c.lang : ""}`,
    imdbId: "",
    type: "tv",
    tags: [countryName, "Live TV"].concat(c.group ? [c.group] : []),
    linkList: [{
      title: "Live Stream",
      quality: "Auto",
      directLinks: [{
        title: c.title,
        link: c.url,
        type: "movie"
      }]
    }],
    webUrl: c.url
  };
};
