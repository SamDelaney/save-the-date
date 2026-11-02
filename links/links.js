// Turns names into personal links: <site>/#to=Name (read by app.js, which
// shows at most 60 characters on the envelope).
const MAX = 60;
const SITE = new URL("../", location.href).href;
const STORE = "save-the-date:names";

const names = document.getElementById("names");
const results = document.getElementById("results");
const head = document.getElementById("results-head");
const count = document.getElementById("count");
const empty = document.getElementById("empty");
const toast = document.getElementById("toast");

const linkFor = (name) => SITE + "#to=" + encodeURIComponent(name);
const canShare = typeof navigator.share === "function";

function list() {
  return names.value.split("\n").map((n) => n.trim().replace(/\s+/g, " ")).filter(Boolean);
}

function render() {
  const all = list();
  results.replaceChildren(...all.map(row));
  head.hidden = all.length === 0;
  empty.hidden = all.length > 0;
  count.textContent = all.length === 1 ? "1 link" : `${all.length} links`;
  try { localStorage.setItem(STORE, names.value); } catch {}
}

function row(name) {
  const url = linkFor(name);
  const li = document.createElement("li");

  const who = document.createElement("p");
  who.className = "who";
  who.textContent = name;
  li.append(who);

  if (name.length > MAX) {
    const warn = document.createElement("p");
    warn.className = "warn";
    warn.textContent = `Too long: only the first ${MAX} letters will show on the envelope.`;
    li.append(warn);
  }

  const link = document.createElement("a");
  link.className = "url";
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = url;
  li.append(link);

  const buttons = document.createElement("div");
  buttons.className = "row-actions";
  buttons.append(
    button("Copy link", "primary", () => copy(url, "Link copied")),
    canShare
      ? button("Send…", "", () => navigator.share({ title: "Save the Date · Sam & Lindsay", url }).catch(() => {}))
      : "",
    button("Preview", "", () => window.open(url, "_blank", "noopener")),
  );
  li.append(buttons);
  return li;
}

function button(text, kind, onClick) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = `btn small ${kind}`.trim();
  b.textContent = text;
  b.addEventListener("click", onClick);
  return b;
}

async function copy(text, message) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Older browsers and non-https pages: fall back to a hidden textarea
    const t = document.createElement("textarea");
    t.value = text;
    t.style.position = "fixed";
    t.style.opacity = "0";
    document.body.append(t);
    t.select();
    document.execCommand("copy");
    t.remove();
  }
  show(message);
}

let timer;
function show(message) {
  toast.textContent = message;
  toast.classList.add("on");
  clearTimeout(timer);
  timer = setTimeout(() => toast.classList.remove("on"), 1800);
}

document.getElementById("copy-all").addEventListener("click", () => {
  const text = list().map((n) => `${n}: ${linkFor(n)}`).join("\n");
  copy(text, "All links copied");
});

try { names.value = localStorage.getItem(STORE) || ""; } catch {}
names.addEventListener("input", render);
render();
