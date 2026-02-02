export function detectLang() {
  const saved = localStorage.getItem("lang");
  if (saved) return saved;

  const navLang = navigator.language || "";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

  const isTR =
    navLang.toLowerCase().startsWith("tr") ||
    tz.toLowerCase().includes("istanbul");

  const lang = isTR ? "tr" : "en";
  localStorage.setItem("lang", lang);
  return lang;
}
