// ===== Site settings — edit these =====
const WHATSAPP_NUMBER = "918892122591"; // country code + number, digits only

const waLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

// Generic WhatsApp links
document.querySelectorAll(".js-wa").forEach((el) => {
  el.href = waLink("Hi Greenishfence! I'd like to know more about staying with you.");
  el.target = "_blank";
  el.rel = "noopener";
});

// Header style on scroll
const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Mobile menu
const toggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("mobile-menu");
const setMenu = (open) => {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menu.hidden = !open;
};
toggle.addEventListener("click", () => setMenu(menu.hidden));
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

// Booking bar -> WhatsApp
const form = document.getElementById("book");
const checkin = document.getElementById("checkin");
const checkout = document.getElementById("checkout");
const hint = document.getElementById("book-hint");
const guestsInput = document.getElementById("guests");
const guestsOut = document.getElementById("guests-out");
const MIN_GUESTS = 1;
const MAX_GUESTS = 15;

const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const today = toISO(new Date());
checkin.min = today;
checkout.min = today;

const fmt = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const fmtShort = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
const nightsBetween = (a, b) => Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 864e5);

// Show friendly dates ("Fri, 24 Oct") instead of the native dd-mm-yyyy box
const renderDates = () => {
  [checkin, checkout].forEach((input) => {
    const el = document.getElementById(`${input.id}-display`);
    el.classList.toggle("empty", !input.value);
    el.textContent = input.value ? fmtShort(input.value) : "Add date";
  });
  if (checkin.value && checkout.value && checkout.value > checkin.value) {
    const n = nightsBetween(checkin.value, checkout.value);
    const tag = document.createElement("span");
    tag.className = "nights";
    tag.textContent = `${n} night${n > 1 ? "s" : ""}`;
    document.getElementById("checkout-display").append(tag);
  }
};

checkin.addEventListener("change", () => {
  checkout.min = checkin.value || today;
  if (checkout.value && checkout.value <= checkin.value) checkout.value = "";
  hint.textContent = "";
  renderDates();
  // Move straight on to picking the check-out date
  if (checkin.value && !checkout.value && checkout.showPicker) {
    try { checkout.showPicker(); } catch (_) {}
  }
});
checkout.addEventListener("change", () => { hint.textContent = ""; renderDates(); });

// Open the picker when the field is clicked (desktop browsers)
document.querySelectorAll(".date-input").forEach((input) =>
  input.addEventListener("click", () => {
    if (input.showPicker) { try { input.showPicker(); } catch (_) {} }
  })
);

// Guest stepper
const stepBtns = document.querySelectorAll(".stepper button");
const setGuests = (n) => {
  const v = Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, n));
  guestsInput.value = v;
  guestsOut.textContent = v;
  guestsOut.nextSibling.textContent = v === 1 ? " guest" : " guests";
  stepBtns[0].disabled = v <= MIN_GUESTS;
  stepBtns[1].disabled = v >= MAX_GUESTS;
};
stepBtns.forEach((b) => b.addEventListener("click", () => setGuests(Number(guestsInput.value) + Number(b.dataset.step))));
setGuests(Number(guestsInput.value));
renderDates();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!checkin.value || !checkout.value) {
    hint.textContent = "Please choose your check-in and check-out dates.";
    (checkin.value ? checkout : checkin).focus();
    return;
  }
  if (checkout.value <= checkin.value) {
    hint.textContent = "Check-out must be after check-in.";
    checkout.focus();
    return;
  }
  hint.textContent = "";
  const nights = nightsBetween(checkin.value, checkout.value);
  const msg = `Hi Greenishfence! I'd like to check availability.\n\nCheck-in: ${fmt(checkin.value)}\nCheck-out: ${fmt(checkout.value)} (${nights} night${nights > 1 ? "s" : ""})\nGuests: ${guestsInput.value}`;
  window.open(waLink(msg), "_blank", "noopener");
});

// Hide the floating WhatsApp button while the booking card is on screen (avoids overlap on phones)
const waFloat = document.querySelector(".wa-float");
new IntersectionObserver(([entry]) => waFloat.classList.toggle("is-hidden", entry.isIntersecting))
  .observe(form);

// Reveal on scroll
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    }),
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  io.observe(el);
});

// Gallery lightbox
const lb = document.getElementById("lightbox");
const lbImg = lb.querySelector("img");
document.querySelectorAll(".g-item").forEach((btn) =>
  btn.addEventListener("click", () => {
    const img = btn.querySelector("img");
    lbImg.src = btn.dataset.full;
    lbImg.alt = img.alt;
    lb.showModal();
  })
);
lb.querySelector(".lb-close").addEventListener("click", () => lb.close());
lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });

document.getElementById("year").textContent = new Date().getFullYear();
