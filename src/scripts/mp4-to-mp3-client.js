import { i18n } from "../lib/i18n.js";
import { detectLang } from "../utils/lang.js";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

/**
 * ✅ Marka / suffix ayarı
 * - "myVideo_saku.mp3" gibi olsun istiyorsan suffix kullan.
 * - "saku_myVideo.mp3" istiyorsan prefix kullan.
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
langBtns.forEach((b) =>
  b.classList.toggle("is-active", b.dataset.lang === current),
);
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

// ✅ dosya adını güvenli hale getirelim
function safeName(name) {
  return (
    String(name)
      .replace(/\.[^.]+$/, "") // extension sil
      .replace(/[^\w\-]+/g, "_") // boşluk ve sembolleri _
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

function isVideoFile(file) {
  if (!file) return false;
  const type = (file.type || "").toLowerCase();
  if (type.startsWith("video/")) return true;
  const name = (file.name || "").toLowerCase();
  return /\.(mp4|mov|mkv|webm|avi|m4v)$/i.test(name);
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
  convertBtn.disabled = v || !selectedFile;
  resetBtn.disabled = v;
  downloadBtn.disabled = v || !outBlob;
}

function resetProgress() {
  progressWrap.hidden = true;
  progressFill.style.width = "0%";
  progressPct.textContent = "0%";
  progressText.textContent = "—";
}

function setProgress(pct, text) {
  const p = Math.max(0, Math.min(100, Math.round(pct)));
  progressWrap.hidden = false;
  progressPct.textContent = p + "%";
  progressFill.style.width = p + "%";
  if (text) progressText.textContent = text;
}

async function ensureFFmpeg() {
  if (isFFmpegReady) return;
  if (ffmpegLoadingPromise) return ffmpegLoadingPromise;

  ffmpegLoadingPromise = (async () => {
    ffmpeg = new FFmpeg({ log: false });

    // ✅ progress event (progress/ratio)
    ffmpeg.on("progress", (p) => {
      const val =
        typeof p?.progress === "number"
          ? p.progress
          : typeof p?.ratio === "number"
          ? p.ratio
          : 0;

      const pct = Math.max(0, Math.min(100, Math.round(val * 100)));
      progressPct.textContent = pct + "%";
      progressFill.style.width = pct + "%";
    });

    setProgress(5, L.loadingFF);
    statusLine.textContent = L.loadingFF;

    // ✅ Cloudflare Pages limit çözümü:
    // core/wasm/worker local değil, CDN üzerinden gelecek (repo’da .wasm tutma)
    // Not: Versiyon sabitlemek stabil olur.
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

    const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript");
    const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm");
    const workerURL = await toBlobURL(
      `${baseURL}/ffmpeg-core.worker.js`,
      "text/javascript",
    );

    // ✅ tek load + timeout
    const loadPromise = ffmpeg.load({ coreURL, wasmURL, workerURL });
    const timeoutPromise = new Promise((_, rej) =>
      setTimeout(
        () => rej(new Error("FFmpeg load timeout (CDN erişilemiyor olabilir)")),
        25000,
      ),
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

  fileInput.value = "";
  controls.hidden = true;
  result.textContent = "";
  fileLine.textContent = "—";
  statusLine.textContent = "—";
  resetProgress();

  showIdle();
  setBusy(false);
}

async function setSelectedFile(file) {
  if (!file) return;

  if (!isVideoFile(file)) {
    result.textContent = L.notVideo;
    return;
  }

  selectedFile = file;

  // output sıfırla
  outBlob = null;
  outName = brandFileName(file.name);
  cleanupOutputUrl();

  controls.hidden = false;
  showDone();

  fileLine.textContent = L.selected(file.name, bytesToNice(file.size));
  statusLine.textContent = "—";
  result.textContent = "";
  downloadBtn.disabled = true;
  resetProgress();

  setBusy(false);
}

// ✅ stabilize mp3 convert command
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

    setProgress(1, L.loadingFF);
    statusLine.textContent = L.loadingFF;

    // ✅ FFmpeg hazırla
    await ensureFFmpeg();

    progressText.textContent = L.reading;
    statusLine.textContent = L.reading;

    const inputName = "input.mp4";
    const outputName = "output.mp3";

    // ✅ RAM'e al
    const inputData = new Uint8Array(await selectedFile.arrayBuffer());

    progressText.textContent = L.writing;
    statusLine.textContent = L.writing;

    // ✅ yaz
    await ffmpeg.writeFile(inputName, inputData);

    progressText.textContent = L.converting;
    statusLine.textContent = L.converting;

    // ✅ convert
    await execConvert(inputName, outputName);

    progressText.textContent = L.exporting;
    statusLine.textContent = L.exporting;

    // ✅ oku
    const outData = await ffmpeg.readFile(outputName);
    outBlob = new Blob([outData], { type: "audio/mpeg" });

    // ✅ temizle
    try {
      await ffmpeg.deleteFile(inputName);
    } catch {}
    try {
      await ffmpeg.deleteFile(outputName);
    } catch {}

    cleanupOutputUrl();
    outUrl = URL.createObjectURL(outBlob);

    const okText = L.done(
      bytesToNice(selectedFile.size),
      bytesToNice(outBlob.size),
    );
    statusLine.textContent = okText;
    result.textContent = okText;

    downloadBtn.disabled = false;
    setProgress(100, okText);

    showDone();
    setBusy(false);
  } catch (e) {
    console.error(e);
    showDone();
    setBusy(false);
    result.textContent = L.err;
    statusLine.textContent = L.err;
  }
}

convertBtn.textContent = L.convert;
downloadBtn.textContent = L.download;
resetBtn.textContent = L.reset;

convertBtn.addEventListener("click", convertToMp3);

downloadBtn.addEventListener("click", () => {
  if (!outBlob || !outUrl) return;

  const a = document.createElement("a");
  a.href = outUrl;
  a.download = outName;
  a.click();
});

resetBtn.addEventListener("click", resetAll);

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (file) setSelectedFile(file);
});

["dragenter", "dragover"].forEach((ev) => {
  dropZone.addEventListener(ev, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add("is-dragover");
  });
});

["dragleave", "dragend"].forEach((ev) => {
  dropZone.addEventListener(ev, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove("is-dragover");
  });
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove("is-dragover");

  const file = e.dataTransfer?.files?.[0];
  if (file) setSelectedFile(file);
});

uploadMore.addEventListener("click", (e) => {
  e.preventDefault();
  resetAll();
});

// init
showIdle();
setBusy(false);
