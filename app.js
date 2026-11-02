// Wedding details. Change them here; the calendar file is save-the-date.ics.
const EVENT = {
  title: "Sam & Lindsay's Wedding",
  date: "2027-06-12",                       // all-day
  venue: "Hidden Farms & Stables",
  address: "21717 40th St E, Buckley, WA 98321",
  details: "Save the date! Formal invitation to follow.",
};

// Mailing addresses go to a Google Form, whose answers land in a private Google
// Sheet. Paste the form's formResponse URL and each question's entry ID here.
// Until `action` is set, the address form stays hidden (add #preview-form to see it).
const ADDRESS_FORM = {
  action: "",   // https://docs.google.com/forms/d/e/<form id>/formResponse
  fields: {
    name: "", street: "", unit: "", city: "", state: "", zip: "", country: "", email: "",
  },
};

const envelope = document.getElementById("envelope");
const stage = envelope.parentElement;
const details = document.getElementById("details");

// Optional personal greeting on the envelope: .../#to=Aunt%20Mary
// (a #fragment never reaches the server, so names stay out of logs)
const to = new URLSearchParams(location.hash.slice(1)).get("to");
if (to) {
  document.getElementById("addressee").textContent = to.slice(0, 60);
  envelope.setAttribute("aria-label", `Open the envelope for ${to.slice(0, 60)}`);
}

// Calendar and map links
const ymd = (d) => d.toISOString().slice(0, 10).replace(/-/g, "");
const start = new Date(EVENT.date + "T00:00:00Z");
const end = new Date(start.getTime() + 864e5);
const location_ = `${EVENT.venue}, ${EVENT.address}`;
document.getElementById("gcal").href =
  "https://calendar.google.com/calendar/render?" +
  new URLSearchParams({
    action: "TEMPLATE",
    text: EVENT.title,
    dates: `${ymd(start)}/${ymd(end)}`,
    details: EVENT.details,
    location: location_,
  });
document.getElementById("map").href =
  "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(location_);

// Countdown in days, counted in the guest's own time zone
const [y, m, d] = EVENT.date.split("-").map(Number);
const today = new Date();
const days = Math.round(
  (new Date(y, m - 1, d) - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 864e5
);
document.getElementById("countdown").innerHTML =
  days > 1 ? `<strong>${days}</strong> days to go`
  : days === 1 ? `<strong>1</strong> day to go`
  : days === 0 ? `<strong>Today!</strong>`
  : `<strong>Just married</strong>`;

// Mailing address form
const form = document.getElementById("address");
const status = document.getElementById("form-status");
const hashParams = new URLSearchParams(location.hash.slice(1));
if (ADDRESS_FORM.action || hashParams.has("preview-form")) {
  form.hidden = false;
  document.getElementById("plain-note").hidden = true;
  if (to) form.elements.name.value = to.slice(0, 60);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const missing = [...form.querySelectorAll("[required]")].find((el) => !el.value.trim());
  if (missing) {
    status.textContent = "Please fill in your name and full address.";
    missing.focus();
    return;
  }
  if (!ADDRESS_FORM.action) {
    status.textContent = "Address collection isn't switched on yet.";
    return;
  }
  const body = new URLSearchParams();
  for (const [key, entry] of Object.entries(ADDRESS_FORM.fields)) {
    if (entry) body.append(entry, form.elements[key].value.trim());
  }
  const button = form.querySelector("button");
  button.disabled = true;
  status.textContent = "Sending...";
  try {
    // Google Forms sends no CORS headers, so the response can't be read; a
    // network failure still throws, which is the case worth reporting.
    await fetch(ADDRESS_FORM.action, { method: "POST", mode: "no-cors", body });
    form.innerHTML =
      `<h2>Thank you!</h2><p class="note">We'll mail your invitation to ${escapeHtml(form.elements.street.value)}.</p>`;
  } catch {
    button.disabled = false;
    status.textContent = "That didn't go through. Please check your connection and try again.";
  }
});

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// Opening sequence: flap flips, card rises, envelope drops away
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
let opened = false;

function open() {
  if (opened) return;
  opened = true;
  stage.classList.add("opened");
  envelope.setAttribute("aria-label", "Your save the date");
  envelope.classList.add("open");
  const steps = reduced ? [0, 0, 0] : [650, 1750, 2500];
  setTimeout(() => envelope.classList.add("rise"), steps[0]);
  setTimeout(() => envelope.classList.add("reveal"), steps[1]);
  setTimeout(() => details.classList.add("show"), steps[2]);
}

envelope.addEventListener("click", open);
