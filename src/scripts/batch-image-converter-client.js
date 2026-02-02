import { i18n } from "../lib/i18n.js";
import { detectLang } from "../utils/lang.js";

import JSZip from "jszip";
import heic2any from "heic2any";

const lang = detectLang();
const t = i18n[lang] || i18n.en;

const TEXT = {
  tr: {
    back: "← Geri",
    tools: "Araçlar",
    badge: "Ücretsiz & Sınırsız",
    title: "Toplu Görsel Dönüştürücü",
    sub: "Birden çok görseli seç, dönüştür ve tek ZIP olarak indir. Upload yok.",
    f1: "🗂️ Toplu",
    f2: "🔒 Upload yok",
    f3: "⚡ Hızlı",

    choose: "Dosya seç",
    addMore: "Dosya ekle",
    idleHint: "veya buraya sürükle.",
    processing: "İşleniyor…",
    ready: "Hazır!",
    uploadMore: "Başka yükle?",
    convert: "Dönüştür + ZIP indir",
    reset: "Sıfırla",

    outFmt: "Çıktı formatı:",
    quality: "Kalite:",

    notImage: "Lütfen geçerli bir görsel seçin.",
    noFiles: "Lütfen önce dosya seçin.",
    converting: "Dönüştürülüyor…",
    zipping: "ZIP hazırlanıyor…",
    done: (n) => `Bitti ✅ ${n} dosya ZIP indirildi.`,
    err: "Hata: Dönüştürme başarısız oldu. Dosya bozuk olabilir veya tarayıcı kısıtı olabilir.",
    svgWarn:
      "Bu SVG tarayıcı içinde dönüştürülemedi. SVG içinde font/harici kaynak/karmaşık filtre olabilir.",
    folderSkip: "Klasörler atlandı (yalnızca dosyalar alınır).",
    dupSkip: "Bazı dosyalar zaten ekliydi, tekrar eklenmedi.",
    errHead: "⚠️ Dönüştürülemeyen Dosyalar",
  },
  en: {
    back: "← Back",
    tools: "Tools",
    badge: "Free & Unlimited",
    title: "Batch Image Converter",
    sub: "Pick multiple images, convert, and download as a single ZIP. No uploads.",
    f1: "🗂️ Batch",
    f2: "🔒 No uploads",
    f3: "⚡ Fast",

    choose: "Choose files",
    addMore: "Add files",
    idleHint: "or drop them here.",
    processing: "Processing…",
    ready: "Ready!",
    uploadMore: "Upload more?",
    convert: "Convert + Download ZIP",
    reset: "Reset",

    outFmt: "Output format:",
    quality: "Quality:",

    notImage: "Please choose a valid image.",
    noFiles: "Please choose files first.",
    converting: "Converting…",
    zipping: "Preparing ZIP…",
    done: (n) => `Done ✅ Downloaded ZIP with ${n} files.`,
    err: "Error: Conversion failed. File may be corrupted or browser-limited.",
    svgWarn:
      "This SVG couldn't be converted in your browser. It may include fonts/external assets/complex filters.",
    folderSkip: "Folders were skipped (only files are accepted).",
    dupSkip: "Some files were already added and were skipped.",
    errHead: "⚠️ Failed Files",
  },
};

const L = TEXT[lang] || TEXT.en;

const $ = (id) => document.getElementById(id);
const set = (id, value) => {
  const el = $(id);
  if (el && value != null) el.textContent = value;
};

// ===== UI i18n =====
set("t-back", t.back ?? L.back);
set("t-navTools", t.toolsHead ?? L.tools);
set("t-badge", t.badge ?? L.badge);

// SSR TR kalsın, EN ise değiştir
if (lang === "en") {
  set("t-title", L.title);
  set("t-sub", L.sub);
  set("t-f1", L.f1);
  set("t-f2", L.f2);
  set("t-f3", L.f3);
}

// ===== lang switch =====
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

// ===== page refs =====
const fileInput = $("file");
const dropZone = $("dropZone");
const uploadMore = $("uploadMore");

const controls = $("controls");
const statusLine = $("statusLine");
const result = $("result");

const convertBtn = $("convert");
const resetBtn = $("reset");

const formatSelect = $("format");
const qualityRange = $("quality");
const qualityVal = $("qualityVal");

const progressWrap = $("progressWrap");
const progressText = $("progressText");
const progressPct = $("progressPct");
const progressFill = $("progressFill");

const previewGrid = $("previewGrid");
const fileCount = $("fileCount");

const stateIdle = document.querySelector(".upload-state.is-idle");
const stateProcessing = document.querySelector(".upload-state.is-processing");
const stateDone = document.querySelector(".upload-state.is-done");

// Error UI (astro tarafında eklediysen çalışır)
const errorBox = document.getElementById("errorBox");
const errorList = document.getElementById("errorList");
const errorCount = document.getElementById("errorCount");
const errorHead = document.getElementById("errorHead");

// error head text
if (errorHead) errorHead.textContent = L.errHead;

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

function cleanBaseName(name) {
  return name.replace(/\.[^.]+$/, "");
}

function getExt(name) {
  const m = (name || "").toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : "";
}

function extFromMime(mime) {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return "png";
}

function safeFileName(name) {
  return name.replace(/[\\/:*?"<>|]+/g, "-").trim();
}

function isProbablyImage(file) {
  const name = (file?.name || "").toLowerCase();
  const type = (file?.type || "").toLowerCase();

  if (type.startsWith("image/")) return true;

  // bazen type boş gelir:
  if (name.endsWith(".heic") || name.endsWith(".heif")) return true;
  if (name.endsWith(".jfif")) return true;
  if (name.endsWith(".svg")) return true;

  return false;
}

// ===== state =====
let files = []; // { id, file, status, previewUrl?, error? }
let isBusy = false;

// ✅ Aynı dosyayı tekrar eklemeyi engelle
const seenFileKeys = new Set();

// ✅ ZIP içindeki isim çakışmalarını engelle
let usedOutNames = new Map();

function fileKey(f) {
  return `${f.name}__${f.size}__${f.lastModified}`;
}

function setBusy(v) {
  isBusy = v;
  if (convertBtn) convertBtn.disabled = v || files.length === 0;
  if (resetBtn) resetBtn.disabled = v;
  if (fileInput) fileInput.disabled = v;
}

function updateCount() {
  if (!fileCount) return;
  fileCount.textContent = String(files.length);
}

function makeId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[m]));
}

// ============== ERROR RENDER ==============
function renderErrors() {
  if (!errorBox || !errorList || !errorCount) return;

  const bad = files.filter((x) => x.status === "err");
  if (!bad.length) {
    errorBox.hidden = true;
    errorList.innerHTML = "";
    errorCount.textContent = "0";
    return;
  }

  errorBox.hidden = false;
  errorList.innerHTML = "";
  errorCount.textContent = String(bad.length);

  for (const it of bad) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="batch-errorfile">${escapeHtml(it.file.name)}</span>
      <span class="batch-errortext"> — ${escapeHtml(it.error || L.err)}</span>`;
    errorList.appendChild(li);
  }
}

function humanizeError(err, file) {
  const msg = String(err?.message || err || "");

  const name = (file?.name || "").toLowerCase();
  const type = (file?.type || "").toLowerCase();

  // SVG
  if (type === "image/svg+xml" || name.endsWith(".svg")) {
    return lang === "tr"
      ? "SVG dönüştürülemedi. SVG içinde font/harici kaynak/filtre olabilir."
      : "SVG could not be converted. It may include fonts/external assets/filters.";
  }

  // HEIC
  if (name.endsWith(".heic") || name.endsWith(".heif") || msg.toLowerCase().includes("heic")) {
    return lang === "tr"
      ? "HEIC/HEIF bu tarayıcıda çözülemedi. (Safari/iOS daha iyi destekler.)"
      : "HEIC/HEIF could not be decoded in this browser. (Safari/iOS works better.)";
  }

  // toBlob null
  if (msg.toLowerCase().includes("toblob") || msg.toLowerCase().includes("blob null")) {
    return lang === "tr"
      ? "Çıktı oluşturulamadı (tarayıcı kısıtı / bellek problemi olabilir)."
      : "Could not create output (browser limitation / memory issue).";
  }

  return msg.slice(0, 180) || L.err;
}

function setItemStatus(id, st, errText = "") {
  const it = files.find((x) => x.id === id);
  if (!it) return;

  it.status = st;

  if (st === "err") it.error = errText || it.error || L.err;
  if (st !== "err") it.error = "";

  const badge = document.querySelector(`[data-batch-badge="${id}"]`);
  if (badge) {
    badge.classList.remove(
      "batch-badge-ok",
      "batch-badge-run",
      "batch-badge-err",
    );

    if (st === "ok") badge.classList.add("batch-badge-ok");
    if (st === "run") badge.classList.add("batch-badge-run");
    if (st === "err") badge.classList.add("batch-badge-err");

    badge.textContent =
      st === "ok" ? "OK" : st === "run" ? "RUN" : st === "err" ? "ERR" : "—";

    // tooltip
    badge.title = st === "err" ? (it.error || L.err) : "";
  }

  renderErrors();
}

// ============== PREVIEW + ITEMS ==============
function resetAll() {
  // revoke preview urls
  for (const it of files) {
    if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
  }

  files = [];
  seenFileKeys.clear();
  usedOutNames = new Map();

  if (fileInput) fileInput.value = "";

  if (controls) controls.hidden = true;
  if (result) result.textContent = "";
  if (statusLine) statusLine.textContent = "—";

  if (progressWrap) progressWrap.hidden = true;
  if (progressFill) progressFill.style.width = "0%";
  if (progressPct) progressPct.textContent = "0%";
  if (progressText) progressText.textContent = "—";

  if (previewGrid) previewGrid.innerHTML = "";
  if (fileCount) fileCount.textContent = "0";

  // error ui reset
  if (errorBox) errorBox.hidden = true;
  if (errorList) errorList.innerHTML = "";
  if (errorCount) errorCount.textContent = "0";

  showIdle();
  setBusy(false);

  ensureAddCard();
}

function removeItem(id) {
  const idx = files.findIndex((x) => x.id === id);
  if (idx === -1) return;

  const it = files[idx];
  if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);

  // seen set’ten de çıkar
  const key = fileKey(it.file);
  seenFileKeys.delete(key);

  files.splice(idx, 1);

  const card = document.querySelector(`[data-batch-card="${id}"]`);
  card?.remove();

  updateCount();
  if (convertBtn) convertBtn.disabled = isBusy || files.length === 0;

  ensureAddCard();
  renderErrors();

  if (files.length === 0) {
    if (controls) controls.hidden = true;
    showIdle();
  }
}

function ensureAddCard() {
  if (!previewGrid) return;
  if (previewGrid.querySelector("[data-batch-addcard='1']")) return;

  const add = document.createElement("button");
  add.type = "button";
  add.className = "batch-add-card";
  add.setAttribute("data-batch-addcard", "1");

  add.innerHTML = `
    <div class="batch-add-plus">+</div>
    <div class="batch-add-text">${L.addMore}</div>
  `;

  add.addEventListener("click", () => {
    if (!fileInput) return;
    fileInput.value = "";
    fileInput.click();
  });

  previewGrid.appendChild(add);
}

function addPreviewCard(item) {
  if (!previewGrid) return;

  // + kartı en sonda kalsın
  const addCard = previewGrid.querySelector("[data-batch-addcard='1']");
  if (addCard) addCard.remove();

  const card = document.createElement("div");
  card.className = "batch-thumb";
  card.setAttribute("data-batch-card", item.id);

  const img = document.createElement("img");
  img.alt = item.file.name;

  let url = null;
  try {
    url = URL.createObjectURL(item.file);
  } catch {
    url = null;
  }
  item.previewUrl = url;
  if (url) img.src = url;

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "batch-remove";
  remove.textContent = "✕";
  remove.title = "Remove";
  remove.addEventListener("click", () => removeItem(item.id));

  const meta = document.createElement("div");
  meta.className = "batch-thumb-meta";

  const name = document.createElement("div");
  name.className = "batch-thumb-name";
  name.textContent = item.file.name;

  const sub = document.createElement("div");
  sub.className = "batch-thumb-sub";

  const badge = document.createElement("span");
  badge.className = "batch-badge-mini";
  badge.setAttribute("data-batch-badge", item.id);
  badge.textContent = "—";

  const fmt = document.createElement("span");
  fmt.className = "batch-badge-mini";
  fmt.textContent = (getExt(item.file.name) || "img").toUpperCase();

  const size = document.createElement("span");
  size.className = "muted";
  size.style.fontSize = "11px";
  size.textContent = bytesToNice(item.file.size);

  const left = document.createElement("div");
  left.style.display = "flex";
  left.style.gap = "6px";
  left.style.alignItems = "center";
  left.appendChild(fmt);
  left.appendChild(badge);

  sub.appendChild(left);
  sub.appendChild(size);

  meta.appendChild(name);
  meta.appendChild(sub);

  card.appendChild(img);
  card.appendChild(remove);
  card.appendChild(meta);

  previewGrid.appendChild(card);

  ensureAddCard();
}

function extractFilesFromDataTransfer(dt) {
  const out = [];
  const items = dt?.items ? Array.from(dt.items) : [];
  const filesList = dt?.files ? Array.from(dt.files) : [];

  let skippedFolder = false;

  if (items.length) {
    for (const it of items) {
      if (it.kind !== "file") continue;
      const entry = it.webkitGetAsEntry?.();
      if (entry && entry.isDirectory) {
        skippedFolder = true;
        continue;
      }
      const f = it.getAsFile?.();
      if (f) out.push(f);
    }

    if (skippedFolder && result) {
      result.textContent = L.folderSkip;
    }

    if (out.length) return out;
  }

  return filesList;
}

function handleAddedFiles(list) {
  if (!list || list.length === 0) return;

  let dupSkipped = false;

  for (const f of list) {
    if (!f || !f.name) continue;
    if (!isProbablyImage(f)) continue;

    const key = fileKey(f);
    if (seenFileKeys.has(key)) {
      dupSkipped = true;
      continue;
    }

    seenFileKeys.add(key);

    const id = makeId();
    const item = { id, file: f, status: "idle", error: "" };
    files.push(item);
    addPreviewCard(item);
  }

  updateCount();
  renderErrors();

  if (controls) controls.hidden = files.length === 0;
  if (files.length > 0) showDone();

  if (convertBtn) convertBtn.disabled = isBusy || files.length === 0;
  if (statusLine) statusLine.textContent = "—";

  if (dupSkipped && result) {
    result.textContent = L.dupSkip;
  } else if (result) {
    // önceki uyarılar kalmasın
    if (!result.textContent.includes(L.folderSkip)) result.textContent = "";
  }
}

// ======= image decode helpers =======
function loadImageFromBlobURL(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function fileToCanvasImage(file) {
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();

  // HEIC/HEIF → JPEG blob
  if (name.endsWith(".heic") || name.endsWith(".heif")) {
    const conv = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.92,
    });
    const outBlob = Array.isArray(conv) ? conv[0] : conv;

    const url = URL.createObjectURL(outBlob);
    try {
      const img = await loadImageFromBlobURL(url);
      return { img, revoke: () => URL.revokeObjectURL(url) };
    } catch (e) {
      URL.revokeObjectURL(url);
      throw e;
    }
  }

  // SVG (BETA): bazen çalışır bazen çalışmaz
  if (name.endsWith(".svg") || type === "image/svg+xml") {
    const svgText = await file.text();
    const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    try {
      const img = await loadImageFromBlobURL(url);
      return { img, revoke: () => URL.revokeObjectURL(url), isSvg: true };
    } catch (e) {
      URL.revokeObjectURL(url);
      const err = new Error(L.svgWarn);
      err.cause = e;
      throw err;
    }
  }

  // Normal raster
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImageFromBlobURL(url);
    return { img, revoke: () => URL.revokeObjectURL(url) };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

function canvasFromImage(img) {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  return canvas;
}

function canvasToBlob(canvas, targetMime, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(
      (b) => resolve(b),
      targetMime,
      targetMime === "image/jpeg" || targetMime === "image/webp"
        ? quality
        : undefined,
    );
  });
}

function readQuality() {
  if (!qualityRange) return 0.92;
  const v = Number(qualityRange.value);
  const q = Math.max(0.4, Math.min(0.98, v / 100));
  if (qualityVal) qualityVal.textContent = `${Math.round(q * 100)}%`;
  return q;
}

// ✅ çıktı adı çakışmasını 100% çözen fonksiyon
function makeUniqueOutName(base, origExt, brand, targetExt) {
  const cleanBase = safeFileName(base);
  const cleanOrig = safeFileName(origExt || "img");

  let candidate = `${cleanBase}-${cleanOrig}-${brand}.${targetExt}`.toLowerCase();
  if (!usedOutNames.has(candidate)) {
    usedOutNames.set(candidate, 1);
    return candidate;
  }

  const n = usedOutNames.get(candidate) + 1;
  usedOutNames.set(candidate, n);

  const withN = `${cleanBase}-${cleanOrig}-${brand}_${n}.${targetExt}`.toLowerCase();
  return withN;
}

async function convertAllToZip() {
  if (files.length === 0) {
    if (result) result.textContent = L.noFiles;
    return;
  }
  if (!formatSelect) {
    if (result) result.textContent = "Format select bulunamadı (#format).";
    return;
  }

  usedOutNames = new Map();

  const targetMime = formatSelect.value;
  const targetExt = extFromMime(targetMime);
  const quality = readQuality();

  setBusy(true);
  showProcessing();

  if (progressWrap) progressWrap.hidden = false;
  if (progressFill) progressFill.style.width = "0%";
  if (progressPct) progressPct.textContent = "0%";
  if (progressText) progressText.textContent = L.converting;
  if (statusLine) statusLine.textContent = L.converting;
  if (result) result.textContent = "";

  // error temizle
  for (const it of files) {
    it.error = "";
    it.status = "idle";
    setItemStatus(it.id, "idle");
  }
  renderErrors();

  const zip = new JSZip();
  let okCount = 0;

  for (let i = 0; i < files.length; i++) {
    const it = files[i];
    setItemStatus(it.id, "run");

    const pct = Math.round((i / files.length) * 100);
    if (progressPct) progressPct.textContent = pct + "%";
    if (progressFill) progressFill.style.width = pct + "%";
    if (progressText) {
      progressText.textContent = `${L.converting} (${i + 1}/${files.length})`;
    }

    try {
      const { img, revoke } = await fileToCanvasImage(it.file);
      const canvas = canvasFromImage(img);

      // JPG: transparan görsellerde siyah olmasın
      if (targetMime === "image/jpeg") {
        const copy = document.createElement("canvas");
        copy.width = canvas.width;
        copy.height = canvas.height;
        const c2 = copy.getContext("2d");

        c2.fillStyle = "#ffffff";
        c2.fillRect(0, 0, copy.width, copy.height);
        c2.drawImage(canvas, 0, 0);

        const ctx = canvas.getContext("2d");
        canvas.width = copy.width;
        canvas.height = copy.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(copy, 0, 0);
      }

      const blob = await canvasToBlob(canvas, targetMime, quality);
      revoke?.();
      if (!blob) throw new Error("Output blob null");

      const base = cleanBaseName(it.file.name);
      const origExt = getExt(it.file.name) || "img";

      // ✅ isim çakışması çözümü
      const outName = makeUniqueOutName(base, origExt, "saku", targetExt);

      const arrayBuffer = await blob.arrayBuffer();
      zip.file(outName, arrayBuffer);

      setItemStatus(it.id, "ok");
      okCount++;
    } catch (e) {
      console.error(e);
      const nice = humanizeError(e, it.file);
      setItemStatus(it.id, "err", nice);
    }
  }

  if (progressText) progressText.textContent = L.zipping;
  if (statusLine) statusLine.textContent = L.zipping;

  try {
    const zipBlob = await zip.generateAsync({ type: "blob" });

    const zipName = `saku-batch-convert.zip`;

    const a = document.createElement("a");
    const url = URL.createObjectURL(zipBlob);
    a.href = url;
    a.download = zipName;
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 2500);

    if (progressPct) progressPct.textContent = "100%";
    if (progressFill) progressFill.style.width = "100%";

    if (statusLine) statusLine.textContent = L.done(okCount);
    if (result) result.textContent = L.done(okCount);

    showDone();
  } catch (e) {
    console.error(e);
    if (statusLine) statusLine.textContent = L.err;
    if (result) result.textContent = L.err;
    showDone();
  } finally {
    setBusy(false);
  }
}

// ===== events =====
if (convertBtn) {
  convertBtn.textContent = L.convert;
  convertBtn.addEventListener("click", convertAllToZip);
}
if (resetBtn) {
  resetBtn.textContent = L.reset;
  resetBtn.addEventListener("click", resetAll);
}

if (uploadMore) {
  uploadMore.addEventListener("click", (e) => {
    e.preventDefault();
    resetAll();
  });
}

if (qualityRange) {
  qualityRange.addEventListener("input", () => readQuality());
  readQuality();
}

if (fileInput) {
  fileInput.addEventListener("change", () => {
    const list = Array.from(fileInput.files || []);
    handleAddedFiles(list);
  });
}

if (dropZone) {
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

    const list = extractFilesFromDataTransfer(e.dataTransfer);
    handleAddedFiles(list);
  });
}

// init
showIdle();
setBusy(false);
updateCount();
renderErrors();
ensureAddCard();
