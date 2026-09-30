"use strict";

const $ = (id) => document.getElementById(id);
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const pad2 = (n) => String(n).padStart(2, "0");
const isoDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const el = {
  pattern: $("pattern"), find: $("find"), replace: $("replace"),
  useRegex: $("useRegex"), matchCase: $("matchCase"), regexError: $("regexError"),
  caseMode: $("caseMode"), start: $("start"), step: $("step"), pad: $("pad"),
  keepExt: $("keepExt"), resetBtn: $("resetBtn"),
  drop: $("drop"), fileInput: $("fileInput"), work: document.querySelector(".work"),
  toolbar: $("toolbar"), count: $("count"), sortBtn: $("sortBtn"), clearBtn: $("clearBtn"),
  list: $("list"), actions: $("actions"), status: $("status"),
  copyBtn: $("copyBtn"), downloadBtn: $("downloadBtn"), toast: $("toast"),
};

let files = []; 
let results = [];   

function splitName(name) {
  const i = name.lastIndexOf(".");
  return i > 0 ? [name.slice(0, i), name.slice(i)] : [name, ""];
}

function applyCase(text, mode) {
  switch (mode) {
    case "lower": return text.toLowerCase();
    case "upper": return text.toUpperCase();
    case "title": return text.toLowerCase().replace(/(^|[\s_-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase());
    case "kebab": return text.toLowerCase().trim().replace(/[\s_]+/g, "-");
    case "snake": return text.toLowerCase().trim().replace(/[\s-]+/g, "_");
    default: return text;
  }
}

function buildFinder() {
  const find = el.find.value;
  el.regexError.hidden = true;
  if (!find) return null;
  try {
    const source = el.useRegex.checked ? find : escapeRegex(find);
    return new RegExp(source, el.matchCase.checked ? "g" : "gi");
  } catch {
    el.regexError.hidden = false;
    return null;
  }
}

function computeNames() {
  const finder = buildFinder();
  const replacement = el.replace.value;
  const pattern = el.pattern.value || "{name}";
  const start = parseInt(el.start.value, 10) || 0;
  const step = parseInt(el.step.value, 10) || 1;
  const digits = Math.min(8, Math.max(1, parseInt(el.pad.value, 10) || 1));
  const today = isoDate(new Date());

  const names = files.map((file, i) => {
    let [base, ext] = splitName(file.name);
    if (finder) base = base.replace(finder, replacement);

    let out = pattern
      .replaceAll("{name}", base)
      .replaceAll("{n}", String(start + i * step).padStart(digits, "0"))
      .replaceAll("{date}", today)
      .replaceAll("{modified}", isoDate(new Date(file.lastModified)));

    out = applyCase(out, el.caseMode.value)
      .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "")
      .trim()
      .replace(/\.+$/, "");

    return out ? out + (el.keepExt.checked ? ext : "") : "";
  });

  const seen = new Map();
  names.forEach((n) => { const k = n.toLowerCase(); seen.set(k, (seen.get(k) || 0) + 1); });

  results = names.map((newName) => {
    if (!newName) return { newName, conflict: true, note: "This name would be empty." };
    if (seen.get(newName.toLowerCase()) > 1) return { newName, conflict: true, note: "Another file gets the same name." };
    return { newName, conflict: false, note: "" };
  });
}

function diffHtml(oldS, newS) {
  if (oldS === newS) return esc(newS);
  let p = 0;
  while (p < oldS.length && p < newS.length && oldS[p] === newS[p]) p++;
  let s = 0;
  while (s < oldS.length - p && s < newS.length - p && oldS[oldS.length - 1 - s] === newS[newS.length - 1 - s]) s++;
  const mid = newS.slice(p, newS.length - s);
  return esc(newS.slice(0, p)) + (mid ? `<mark>${esc(mid)}</mark>` : "") + esc(newS.slice(newS.length - s));
}

function render() {
  computeNames();
  const has = files.length > 0;
  el.work.classList.toggle("has-files", has);
  el.toolbar.hidden = !has;
  el.actions.hidden = !has;

  el.list.innerHTML = files.map((f, i) => {
    const r = results[i];
    const changed = r.newName !== f.name;
    const cls = r.conflict ? "row conflict" : changed ? "row changed" : "row";
    return `<li class="${cls}">
      <div class="names">
        <span class="old">${esc(f.name)}</span>
        <span class="arrow" aria-hidden="true">→</span>
        <span class="new">${r.newName ? diffHtml(f.name, r.newName) : "(empty)"}</span>
      </div>
      <button type="button" class="remove" data-i="${i}" aria-label="Remove ${esc(f.name)}">×</button>
      <span class="note">${esc(r.note)}</span>
    </li>`;
  }).join("");

  el.count.textContent = `${files.length} ${files.length === 1 ? "file" : "files"}`;

  const conflicts = results.filter((r) => r.conflict).length;
  const changes = results.filter((r, i) => !r.conflict && r.newName !== files[i].name).length;
  el.downloadBtn.disabled = !has || conflicts > 0 || changes === 0;

  if (conflicts) {
    el.status.className = "status bad";
    el.status.textContent = `Fix ${conflicts} ${conflicts === 1 ? "name" : "names"} marked in red before downloading.`;
  } else if (has && changes === 0) {
    el.status.className = "status";
    el.status.textContent = "No names change yet. Edit a rule on the left.";
  } else if (has) {
    el.status.className = "status ok";
    el.status.textContent = `${changes} of ${files.length} will be renamed.`;
  }
}

function addFiles(list) {
  const known = new Set(files.map((f) => `${f.name}|${f.size}|${f.lastModified}`));
  let skipped = 0;
  for (const f of list) {
    const key = `${f.name}|${f.size}|${f.lastModified}`;
    if (known.has(key)) { skipped++; continue; }
    known.add(key);
    files.push(f);
  }
  render();
  if (skipped) toast(`${skipped} duplicate ${skipped === 1 ? "file was" : "files were"} skipped.`);
}

el.fileInput.addEventListener("change", () => { addFiles(el.fileInput.files); el.fileInput.value = ""; });

["dragenter", "dragover"].forEach((ev) => el.drop.addEventListener(ev, (e) => { e.preventDefault(); el.drop.classList.add("over"); }));
["dragleave", "drop"].forEach((ev) => el.drop.addEventListener(ev, (e) => { e.preventDefault(); el.drop.classList.remove("over"); }));
el.drop.addEventListener("drop", (e) => addFiles(e.dataTransfer.files));
["dragover", "drop"].forEach((ev) => window.addEventListener(ev, (e) => e.preventDefault()));

el.list.addEventListener("click", (e) => {
  const btn = e.target.closest(".remove");
  if (!btn) return;
  files.splice(Number(btn.dataset.i), 1);
  render();
});

el.clearBtn.addEventListener("click", () => { files = []; render(); });
el.sortBtn.addEventListener("click", () => {
  files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
  render();
  toast("Sorted A to Z. Numbers follow this order.");
});

[el.pattern, el.find, el.replace, el.useRegex, el.matchCase, el.caseMode, el.start, el.step, el.pad, el.keepExt]
  .forEach((input) => input.addEventListener("input", render));

$("chips").addEventListener("click", (e) => {
  const chip = e.target.closest("button[data-token]");
  if (!chip) return;
  const token = chip.dataset.token;
  const a = el.pattern.selectionStart ?? el.pattern.value.length;
  const b = el.pattern.selectionEnd ?? a;
  el.pattern.setRangeText(token, a, b, "end");
  el.pattern.focus();
  render();
});

el.resetBtn.addEventListener("click", () => {
  el.pattern.value = "{name}";
  el.find.value = ""; el.replace.value = "";
  el.useRegex.checked = false; el.matchCase.checked = false;
  el.caseMode.value = "none";
  el.start.value = 1; el.step.value = 1; el.pad.value = 2;
  el.keepExt.checked = true;
  render();
});

el.copyBtn.addEventListener("click", async () => {
  const text = files.map((f, i) => `${f.name} -> ${results[i].newName}`).join("\n");
  try {
    await navigator.clipboard.writeText(text);
    toast("Name list copied.");
  } catch {
    toast("Couldn't copy. Your browser blocked clipboard access.");
  }
});

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function makeZip(items) {
  const enc = new TextEncoder();
  const now = new Date();
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const body = [], central = [];
  let offset = 0;

  for (const { name, data } of items) {
    const nameBytes = enc.encode(name);
    const crc = crc32(data), size = data.length;

    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true);
    lh.setUint16(4, 20, true);
    lh.setUint16(6, 0x0800, true);
    lh.setUint16(10, time, true);
    lh.setUint16(12, date, true);
    lh.setUint32(14, crc, true);
    lh.setUint32(18, size, true);
    lh.setUint32(22, size, true);
    lh.setUint16(26, nameBytes.length, true);
    body.push(lh.buffer, nameBytes, data);

    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true);
    ch.setUint16(4, 20, true);
    ch.setUint16(6, 20, true);
    ch.setUint16(8, 0x0800, true);
    ch.setUint16(12, time, true);
    ch.setUint16(14, date, true);
    ch.setUint32(16, crc, true);
    ch.setUint32(20, size, true);
    ch.setUint32(24, size, true);
    ch.setUint16(28, nameBytes.length, true);
    ch.setUint32(42, offset, true);
    central.push(ch.buffer, nameBytes);

    offset += 30 + nameBytes.length + size;
  }

  const cdSize = central.reduce((sum, part) => sum + part.byteLength, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, items.length, true);
  end.setUint16(10, items.length, true);
  end.setUint32(12, cdSize, true);
  end.setUint32(16, offset, true);

  return new Blob([...body, ...central, end.buffer], { type: "application/zip" });
}

el.downloadBtn.addEventListener("click", async () => {
  el.downloadBtn.disabled = true;
  el.downloadBtn.textContent = "Preparing ZIP…";
  try {
    const items = [];
    for (let i = 0; i < files.length; i++) {
      items.push({ name: results[i].newName, data: new Uint8Array(await files[i].arrayBuffer()) });
    }
    const url = URL.createObjectURL(makeZip(items));
    const a = Object.assign(document.createElement("a"), { href: url, download: "renamed-files.zip" });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast(`Downloaded ${items.length} renamed ${items.length === 1 ? "file" : "files"}.`);
  } catch {
    toast("Something went wrong while building the ZIP. Try fewer files.");
  } finally {
    el.downloadBtn.textContent = "Download renamed files";
    render();
  }
});

let toastTimer;
function toast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2600);
}

$("year").textContent = new Date().getFullYear();
render();