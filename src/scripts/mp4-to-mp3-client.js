import { i18n } from "../lib/i18n.js";
import { detectLang } from "../utils/lang.js";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

/**
 * ✅ Marka / suffix ayarı
 */
const BRAND = "saku";
const BRAND_MODE = "suffix"; // "suffix" | "prefix"

const lang = detectLang();
const t = i18n[lang] || i18n.en;

const TEXT = {
  tr: {
    back: "← Geri",
    tools: "Araçlar",
    badge: "Ücretsiz & Sınırsız",
    title: "MP4 → MP3",
    sub: "Videonu MP3'e çevir. Upload yok, tarayıcı içinde.",
    f1: "🎬 MP4",
    f2: "🎧 MP3",
    f3: "🔒 Upload yok",
    bcHome: "Anasayfa",
    choose: "Video seç",
    idleHint: "veya buraya sürükle.",
    processing: "İşleniyor…",
    ready: "Hazır!",
    uploadMore: "Başka yükle?",
    convert: "MP3'e dönüştür",
    download: "İndir",
    reset: "Sıfırla",
    notVideo: "Lütfen bir video dosyası seçin.",
    loadingFF: "Dönüştürücü hazırlanıyor… (ilk sefer biraz sürebilir)",
    converting: "Dönüştürülüyor…",
    reading: "Video okunuyor…",
    writing: "Video yazılıyor…",
    exporting: "MP3 hazırlanıyor…",
    done: (a, b) => `Bitti ✅ MP3 hazır. (${a} → ${b})`,
    err: "Hata: Dönüştürme başarısız oldu. Dosya çok büyük olabilir veya tarayıcı kısıtı olabilir.",
    selected: (name, size) => `Seçildi: ${name} (${size})`,
  },
  en: {
    back: "← Back",
    tools: "Tools",
    badge: "Free & Unlimited",
    title: "MP4 → MP3",
    sub: "Convert your video to MP3. No uploads, in-browser.",
    f1: "🎬 MP4",
    f2: "🎧 MP3",
    f3: "🔒 No uploads",
    bcHome: "Home",
    choose: "Choose video",
    idleHint: "or drop it here.",
    processing: "Processing…",
    ready: "Ready!",
    uploadMore: "Upload more?",
    convert: "Convert to MP3",
    download: "Download",
    reset: "Reset",
    notVideo: "Please choose a video file.",
    loadingFF: "Preparing converter… (first time may take a bit)",
    converting: "Converting…",
    reading: "Reading video…",
    writing: "Writing video…",
    exporting: "Preparing MP3…",
    done: (a, b) => `Done ✅ MP3 ready. (${a} → ${b})`,
    err: "Error: Conversion failed. The file may be too large or browser-limited.",
    selected: (name, size) => `Selected: ${name} (${size})`,
  },
};

const L = TEXT[lang] || TEXT.en;

const $ = (id) => document.getElementById(id);
const set = (id, value) => {
  const el = $(id);
  if (el && value != null) el.textContent = value;
};

// i18n apply
set("t-back", t.back ?? L.back);
set("t-navTools", t.toolsHead ?? L.tools);
set("t-badge", t.badge ?? L.badge);
set("t-title", L.title);
set("t-sub", L.sub);
set("t-f1", L.f1);
set("t-f2", L.f2);
set("t-f3", L.f3);
set("t-bcHome", L.bcHome);
set("t-bcHere", "MP4 to MP3");
set("t-choose", L.choose);
set("idleHint", L.idleHint);
set("t-processing", L.processing);
set("t-ready", L.ready);
set("t-uploadMore", L.uploadMore);

// lang switch UI
const langBtns = document.querySelectorAll(".lang-btn");
const current = localStorage.getItem("lang") || lang;
langBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.lang === current));
langBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    localStorage.setItem("lang", btn.dataset.lang);
    location.reload();
  });
});

// mini hero anim
const miniHero = $("miniHero");
requestAnimationFrame(() => miniHero?.classList.add("is-entered"));

// UI refs
const fileInput = $("file");
const dropZone = $("dropZone");
const uploadMore = $("uploadMore");
const controls = $("controls");
const fileLine = $("fileLine");
const statusLine = $("statusLine");
const convertBtn = $("convert");
const downloadBtn = $("download");
const resetBtn = $("reset");
const result = $("result");
const progressWrap = $("progressWrap");
const progressText = $("progressText");
const progressPct = $("progressPct");
const progressFill = $("progressFill");

const stateIdle = document.querySelector(".upload-state.is-idle");
const stateProcessing = document.querySelector(".upload-state.is-processing");
const stateDone = document.querySelector(".upload-state.is-done");

function showIdle() {
  stateIdle.hidden = false;
  stateProcessing.hidden = true;
  stateDone.hidden = true;
}
function showProcessing() {
  stateIdle.hidden = true;
  stateProcessing.hidden = false;
  stateDone.hidden = true;
}
function showDone() {
  stateIdle.hidden = true;
  stateProcessing.hidden = true;
  stateDone.hidden = false;
}

function bytesToNice(n) {
  const kb = n / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function safeName(name) {
  return (
    String(name)
      .replace(/\.[^.]+$/, "")
      .replace(/[^\w\-]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 60) || "output"
  );
}

function brandFileName(base) {
  const n = safeName(base);
  if (!BRAND) return `${n}.mp3`;

  const b = safeName(BRAND);
  if (BRAND_MODE === "prefix") return `${b}_${n}.mp3`;
  return `${n}_${b}.mp3`;
}

let selectedFile = null;
let outBlob = null;
let outUrl = null;
let outName = "output.mp3";
let isBusy = false;

// ✅ FFmpeg init cache
let ffmpeg = null;
let isFFmpegReady = false;
let ffmpegLoadingPromise = null;

function setBusy(v) {
  isBusy = v;
  if (convertBtn) convertBtn.disabled = v || !selectedFile;
  if (resetBtn) resetBtn.disabled = v;
  if (downloadBtn) downloadBtn.disabled = v || !outBlob;
}

function resetProgress() {
  if (!progressWrap) return;
  progressWrap.hidden = true;
  if (progressFill) progressFill.style.width = "0%";
  if (progressPct) progressPct.textContent = "0%";
  if (progressText) progressText.textContent = "—";
}

async function ensureFFmpeg() {
  if (isFFmpegReady) return;
  if (ffmpegLoadingPromise) return ffmpegLoadingPromise;

  ffmpegLoadingPromise = (async () => {
    ffmpeg = new FFmpeg({ log: false });

    ffmpeg.on("progress", (p) => {
      const val =
        typeof p?.progress === "number"
          ? p.progress
          : typeof p?.ratio === "number"
            ? p.ratio
            : 0;

      const pct = Math.max(0, Math.min(100, Math.round(val * 100)));
      if (progressPct) progressPct.textContent = pct + "%";
      if (progressFill) progressFill.style.width = pct + "%";
    });

    if (progressWrap) progressWrap.hidden = false;
    if (progressFill) progressFill.style.width = "0%";
    if (progressPct) progressPct.textContent = "0%";
    if (progressText) progressText.textContent = L.loadingFF;
    if (statusLine) statusLine.textContent = L.loadingFF;

    // ✅ Cloudflare Pages 25MiB limitine takılmamak için core/wasm/worker CDN’den
    // (ffmpeg-core.worker.js dosya adı önemli)
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

    const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript");
    const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm");
    const workerURL = await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript");

    const loadPromise = ffmpeg.load({ coreURL, wasmURL, workerURL });
    const timeoutPromise = new Promise((_, rej) =>
      setTimeout(() => rej(new Error("FFmpeg load timeout (CDN/core/wasm/worker erişilemiyor)")), 25000),
    );

    await Promise.race([loadPromise, timeoutPromise]);
    isFFmpegReady = true;
  })();

  return ffmpegLoadingPromise;
}

function cleanupOutputUrl() {
  if (outUrl) {
    URL.revokeObjectURL(outUrl);
    outUrl = null;
  }
}

function resetAll() {
  selectedFile = null;
  outBlob = null;
  outName = "output.mp3";
  cleanupOutputUrl();

  if (fileInput) fileInput.value = "";
  if (controls) controls.hidden = true;
  if (result) result.textContent = "";
  if (fileLine) fileLine.textContent = "—";
  if (statusLine) statusLine.textContent = "—";
  resetProgress();

  showIdle();
  setBusy(false);
}

async function setSelectedFile(file) {
  if (!file) return;

  // bazı tarayıcılarda type boş gelebilir -> name’e de bak
  const name = (file.name || "").toLowerCase();
  const isVideo = (file.type || "").startsWith("video/") || /\.(mp4|mov|m4v|webm|mkv)$/i.test(name);

  if (!isVideo) {
    if (result) result.textContent = L.notVideo;
    return;
  }

  selectedFile = file;

  outBlob = null;
  outName = brandFileName(file.name);
  cleanupOutputUrl();

  if (controls) controls.hidden = false;
  showDone();

  if (fileLine) fileLine.textContent = L.selected(file.name, bytesToNice(file.size));
  if (statusLine) statusLine.textContent = "—";
  if (result) result.textContent = "";
  if (downloadBtn) downloadBtn.disabled = true;
  resetProgress();

  setBusy(false);
}

async function execConvert(inputName, outputName) {
  await ffmpeg.exec([
    "-i",
    inputName,
    "-vn",
    "-ar",
    "44100",
    "-ac",
    "2",
    "-b:a",
    "192k",
    outputName,
  ]);
}

async function convertToMp3() {
  if (!selectedFile || isBusy) return;

  try {
    setBusy(true);
    showProcessing();

    if (progressWrap) progressWrap.hidden = false;
    if (progressFill) progressFill.style.width = "0%";
    if (progressPct) progressPct.textContent = "0%";
    if (progressText) progressText.textContent = L.loadingFF;
    if (statusLine) statusLine.textContent = L.loadingFF;

    await ensureFFmpeg();

    if (progressText) progressText.textContent = L.reading;
    if (statusLine) statusLine.textContent = L.reading;

    const inputName = "input.mp4";
    const outputName = "output.mp3";

    const inputData = new Uint8Array(await selectedFile.arrayBuffer());

    if (progressText) progressText.textContent = L.writing;
    if (statusLine) statusLine.textContent = L.writing;

    await ffmpeg.writeFile(inputName, inputData);

    if (progressText) progressText.textContent = L.converting;
    if (statusLine) statusLine.textContent = L.converting;

    await execConvert(inputName, outputName);

    if (progressText) progressText.textContent = L.exporting;
    if (statusLine) statusLine.textContent = L.exporting;

    const outData = await ffmpeg.readFile(outputName);
    outBlob = new Blob([outData], { type: "audio/mpeg" });

    // cleanup
    try { await ffmpeg.deleteFile(inputName); } catch {}
    try { await ffmpeg.deleteFile(outputName); } catch {}

    cleanupOutputUrl();
    outUrl = URL.createObjectURL(outBlob);

    const okText = L.done(bytesToNice(selectedFile.size), bytesToNice(outBlob.size));
    if (statusLine) statusLine.textContent = okText;
    if (result) result.textContent = okText;

    if (downloadBtn) downloadBtn.disabled = false;
    showDone();
    setBusy(false);
  } catch (e) {
    console.error(e);
    showDone();
    setBusy(false);
    if (result) result.textContent = L.err;
    if (statusLine) statusLine.textContent = L.err;
  }
}

if (convertBtn) convertBtn.textContent = L.convert;
if (downloadBtn) downloadBtn.textContent = L.download;
if (resetBtn) resetBtn.textContent = L.reset;

convertBtn?.addEventListener("click", convertToMp3);

downloadBtn?.addEventListener("click", () => {
  if (!outBlob || !outUrl) return;
  const a = document.createElement("a");
  a.href = outUrl;
  a.download = outName;
  a.click();
});

resetBtn?.addEventListener("click", resetAll);

fileInput?.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (file) setSelectedFile(file);
});

["dragenter", "dragover"].forEach((ev) => {
  dropZone?.addEventListener(ev, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add("is-dragover");
  });
});

["dragleave", "dragend"].forEach((ev) => {
  dropZone?.addEventListener(ev, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove("is-dragover");
  });
});

dropZone?.addEventListener("drop", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove("is-dragover");
  const file = e.dataTransfer?.files?.[0];
  if (file) setSelectedFile(file);
});

uploadMore?.addEventListener("click", (e) => {
  e.preventDefault();
  resetAll();
});

// init
showIdle();
setBusy(false);
