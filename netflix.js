const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxAO9iNli2uvZNySvsdMaSRRP9ogdLvLmgz_3AKc6jjl-3tRFNGjgT9y0V0EaXn07Xt/exec";
const FALLBACK_IMAGE = "logo.png";
const PREVIEW_SECONDS = 10;
const PREVIEW_BASE_START = 30 * 60;
let movieCache = null;

async function getMovies() {
  if (movieCache) return movieCache;
  const response = await fetch(`${SCRIPT_URL}?t=${Date.now()}`);
  const data = await response.json();
  movieCache = Array.isArray(data) ? data : data.movies || data.films || data.data || [];
  return movieCache.filter(Boolean);
}

function normalizeText(value) {
  return String(value || "").toLocaleLowerCase("tr-TR").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u").trim();
}

function getSafeUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(String(value), window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function getYouTubeUrl(value) {
  const safe = getSafeUrl(value);
  if (!safe) return "";
  try {
    const url = new URL(safe);
    const host = url.hostname.replace(/^www\./, "");
    return ["youtube.com", "m.youtube.com", "youtu.be", "youtube-nocookie.com"].includes(host) ? safe : "";
  } catch {
    return "";
  }
}

function getYouTubeId(value) {
  const safe = getYouTubeUrl(value);
  if (!safe) return "";
  const url = new URL(safe);
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] || "";
  if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/").filter(Boolean)[1] || "";
  if (url.pathname.startsWith("/embed/")) return url.pathname.split("/").filter(Boolean)[1] || "";
  return url.searchParams.get("v") || "";
}

function getYouTubeThumbnail(value) {
  const id = getYouTubeId(value);
  return id ? `https://img.youtube.com/vi/${encodeURIComponent(id)}/hqdefault.jpg` : "";
}

function getEmbedUrl(value) {
  const id = getYouTubeId(value);
  return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : "";
}

function getPreviewStart(movie) {
  const customStart = Number(movie.previewStart || movie.preview_start || movie.preview || 0);
  if (Number.isFinite(customStart) && customStart > 0) return Math.floor(customStart);
  const numericId = Number(movie.id || 0);
  const offset = Number.isFinite(numericId) ? (numericId % 12) * 60 : 0;
  return PREVIEW_BASE_START + offset;
}

function getPreviewEmbedUrl(movie) {
  const id = getYouTubeId(movie.youtube || movie.youtubeUrl || movie.youtubeURL);
  if (!id) return "";
  const start = getPreviewStart(movie);
  const end = start + PREVIEW_SECONDS;
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
    start: String(start),
    end: String(end)
  });
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${params.toString()}`;
}

function getMoviePoster(movie) {
  const fields = ["poster", "posterUrl", "posterURL", "poster_url", "image", "img", "afis", "afiş", "gorsel", "görsel"];
  for (const field of fields) {
    const safe = getSafeUrl(movie[field]);
    if (safe) return safe;
  }
  return getYouTubeThumbnail(movie.youtube || movie.youtubeUrl || movie.youtubeURL) || FALLBACK_IMAGE;
}

function movieHref(movie) {
  return `movie.html?id=${encodeURIComponent(movie.id || "")}`;
}

function shortDescription(movie) {
  const text = String(movie.description || movie.aciklama || movie.açıklama || "").replace(/\s+/g, " ").trim();
  return text || "Yeşilçam arşivinden seçilmiş film.";
}

function createMovieCard(movie) {
  const card = document.createElement("a");
  card.className = "poster-card";
  card.href = movieHref(movie);
  const poster = document.createElement("div");
  poster.className = "poster";
  const posterUrl = getMoviePoster(movie);
  poster.style.backgroundImage = `url("${posterUrl}")`;
  if (posterUrl === FALLBACK_IMAGE) {
    const fallback = document.createElement("div");
    fallback.className = "poster-fallback";
    fallback.textContent = movie.title || "Yeşilçam";
    poster.appendChild(fallback);
  }
  const previewUrl = getPreviewEmbedUrl(movie);
  if (previewUrl) {
    card.classList.add("has-preview");
    card.setAttribute("aria-label", `${movie.title || "Film"} - 10 saniyelik ön izleme için üzerine gelin`);
    attachHoverPreview(card, poster, previewUrl);
  }
  const info = document.createElement("div");
  info.className = "poster-info";
  const title = document.createElement("div");
  title.className = "poster-title";
  title.textContent = movie.title || "İsimsiz Film";
  const meta = document.createElement("div");
  meta.className = "poster-meta";
  meta.textContent = [movie.genre, movie.year].filter(Boolean).join(" · ");
  info.append(title, meta);
  card.append(poster, info);
  return card;
}


function attachHoverPreview(card, poster, previewUrl) {
  let previewTimer = 0;
  let cleanupTimer = 0;

  function clearPreview() {
    window.clearTimeout(previewTimer);
    window.clearTimeout(cleanupTimer);
    card.classList.remove("previewing");
    poster.querySelector(".preview-frame")?.remove();
  }

  function startPreview() {
    window.clearTimeout(previewTimer);
    previewTimer = window.setTimeout(() => {
      if (poster.querySelector(".preview-frame")) return;
      const frame = document.createElement("iframe");
      frame.className = "preview-frame";
      frame.src = previewUrl;
      frame.title = "10 saniyelik film ön izlemesi";
      frame.loading = "lazy";
      frame.allow = "autoplay; encrypted-media; picture-in-picture";
      frame.setAttribute("aria-hidden", "true");
      poster.appendChild(frame);
      card.classList.add("previewing");
      cleanupTimer = window.setTimeout(clearPreview, PREVIEW_SECONDS * 1000);
    }, 450);
  }

  card.addEventListener("mouseenter", startPreview);
  card.addEventListener("mouseleave", clearPreview);
  card.addEventListener("focusin", startPreview);
  card.addEventListener("focusout", clearPreview);
}

function uniqueValues(movies, field, splitByComma = false) {
  const values = new Set();
  movies.forEach((movie) => {
    const raw = movie[field];
    if (!raw) return;
    const parts = splitByComma ? String(raw).split(",") : [raw];
    parts.map((item) => String(item).trim()).filter(Boolean).forEach((item) => values.add(item));
  });
  return Array.from(values).sort((a, b) => a.localeCompare(b, "tr"));
}

function sampleMovies(movies, count) {
  return [...movies].sort(() => Math.random() - 0.5).slice(0, count);
}

function setupQuickSearch(movies) {
  const input = document.querySelector("[data-quick-search]");
  if (!input) return;
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const query = normalizeText(input.value);
    const match = movies.find((movie) => normalizeText(movie.title).includes(query));
    if (match) window.location.href = movieHref(match);
  });
}

function setHero(movie) {
  const hero = document.querySelector("[data-hero]");
  if (!hero || !movie) return;
  hero.style.setProperty("--hero-image", `url("${getMoviePoster(movie)}")`);
  hero.querySelector("[data-hero-title]").textContent = movie.title || "Yeşilçam";
  hero.querySelector("[data-hero-copy]").textContent = shortDescription(movie);
  hero.querySelector("[data-hero-meta]").replaceChildren(...[movie.year, movie.genre, movie.period].filter(Boolean).map((text) => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = text;
    return span;
  }));
  hero.querySelector("[data-hero-play]").href = movieHref(movie);
  const youtube = getYouTubeUrl(movie.youtube || movie.youtubeUrl || movie.youtubeURL);
  const watch = hero.querySelector("[data-hero-youtube]");
  if (youtube) {
    watch.href = youtube;
    watch.hidden = false;
  } else {
    watch.hidden = true;
  }
}

function renderRail(container, movies) {
  container.replaceChildren(...movies.map(createMovieCard));
}

function groupByGenre(movies) {
  const groups = new Map();
  movies.forEach((movie) => {
    const genre = String(movie.genre || "Arşivden Seçmeler").trim();
    if (!groups.has(genre)) groups.set(genre, []);
    groups.get(genre).push(movie);
  });
  return Array.from(groups.entries()).filter(([, items]) => items.length > 1);
}
