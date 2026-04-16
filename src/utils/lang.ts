import type { Lang } from "../lib/i18n";

export function detectLang(): Lang {
    if (typeof window === "undefined") return "tr";
    try {
        const saved = localStorage.getItem("lang") as Lang | null;
        if (saved === "tr" || saved === "en") return saved;

        const nav = (navigator.language || "").toLowerCase();
        const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || "").toLowerCase();
        const isTR = nav.startsWith("tr") || tz.includes("istanbul");
        const lang: Lang = isTR ? "tr" : "en";
        localStorage.setItem("lang", lang);
        return lang;
    } catch {
        return "tr";
    }
}

export function applyLang(lang: Lang, dict: Record<string, string>): void {
    document.documentElement.lang = lang;
    for (const [key, value] of Object.entries(dict)) {
        const el = document.getElementById("t-" + key);
        if (el) el.textContent = value;
    }
    document.querySelectorAll<HTMLElement>(".lang-btn").forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.lang === lang);
    });
    try {
        localStorage.setItem("lang", lang);
    } catch {}
}
