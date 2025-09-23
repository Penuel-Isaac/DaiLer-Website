/* js/script.js
   Handles:
   - mobile nav toggle
   - demo ranking function
   - counters animation
   - flip card interactions
   - EmailJS contact form submission & validation
*/

/* --------- EmailJS init (replace YOUR_PUBLIC_KEY) --------- */
(function() {
  if (window.emailjs) {
    // Replace with your public key from EmailJS dashboard
    emailjs.init("VWQZNMkFatj1BQqp9");
  }
})();

/* --------- Helpers --------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* --------- Mobile nav toggle --------- */
document.addEventListener("DOMContentLoaded", () => {
  const toggles = $$(".nav-toggle");
  toggles.forEach(t => {
    const id = t.getAttribute("id");
    const idx = id ? id.replace('navToggle','') : '';
    const nav = $(`#mainNav${idx}`) || $("#mainNav");
    t.addEventListener("click", () => {
      if (nav.classList.contains("nav-open")) nav.classList.remove("nav-open");
      else nav.classList.add("nav-open");
    });
  });

  // demo rank button
  const rankBtn = $("#rankBtn");
  if (rankBtn) {
    rankBtn.addEventListener("click", () => {
      const w = parseFloat($("#expWeight").value) || 0.6;
      const ranked = rankCandidates(SAMPLE_CANDIDATES, w);
      $("#rankResult").innerHTML = ranked.map(r => `<div>${r.name} — score: ${r.score}</div>`).join("");
    });
  }

  // counters
  animateCounters();

  // flip cards keyboard accessibility
  $$(".flip-card").forEach(card => {
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") flipCard(card);
    });
  });

  // wire contact form submit
  const contactForm = $("#contactForm");
  if (contactForm) contactForm.addEventListener("submit", submitContact);
});

/* --------- Demo ranking function (parameters & return) --------- */
/**
 * rankCandidates
 * @param {Array<Object>} candidates - [{name, experience, skillScore}]
 * @param {Number} expWeight - weight between 0 and 1
 * @returns {Array<Object>} sorted by score desc
 */
function rankCandidates(candidates, expWeight = 0.6) {
  const maxExp = 20;
  function scoreCandidate(c) {
    const normExp = Math.min((c.experience || 0) / maxExp, 1);
    const score = expWeight * normExp + (1 - expWeight) * (c.skillScore || 0);
    return Number(score.toFixed(3));
  }
  const results = candidates.map(c => ({ ...c, score: scoreCandidate(c) }));
  results.sort((a,b) => b.score - a.score);
  return results;
}

/* sample */
const SAMPLE_CANDIDATES = [
  { name: "Ada", experience: 5, skillScore: 0.8 },
  { name: "Bayo", experience: 8, skillScore: 0.7 },
  { name: "Chika", experience: 3, skillScore: 0.95 }
];

/* --------- Counters animation --------- */
function animateCounters() {
  const counters = $$(".stat-number");
  counters.forEach(el => {
    const target = +el.getAttribute("data-target") || 0;
    let current = 0;
    const step = Math.max(1, Math.round(target / 60));
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        el.textContent = target;
        clearInterval(interval);
      } else {
        el.textContent = current;
      }
    }, 20);
  });
}

/* --------- Flip card toggle --------- */
function flipCard(el) {
  if (!el) return false;
  el.classList.toggle("flipped");
  return el.classList.contains("flipped");
}

/* --------- Contact form validation --------- */
function validateContactForm(form) {
  const errors = [];
  const name = (form.querySelector("#firstName") || form.querySelector("#from_name") || {}).value || "";
  const email = (form.querySelector("#email") || {}).value || "";
  const message = (form.querySelector("#message") || {}).value || "";
  const consent = (form.querySelector("#consent") || {}).checked;

  if (!name.trim()) errors.push("Name is required");
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push("A valid email is required");
  if (!message.trim()) errors.push("Please write a message");
  if (!consent) errors.push("Consent is required");

  return { valid: errors.length === 0, errors };
}

/* --------- Submit contact via EmailJS --------- */
/**
 * submitContact
 * Uses emailjs.sendForm to send the contact form.
 * Replace YOUR_SERVICE_ID and YOUR_TEMPLATE_ID with your EmailJS values.
 */
async function submitContact(e) {
  if (e) e.preventDefault();
  const form = $("#contactForm");
  const out = $("#formMessage");
  if (!form || !out) return false;

  const { valid, errors } = validateContactForm(form);
  if (!valid) {
    out.style.color = "crimson";
    out.textContent = errors.join("; ");
    return false;
  }

  out.style.color = "green";
  out.textContent = "Sending message...";

  try {
    // Replace these with your EmailJS IDs
    const serviceID = "service_g5w88ad";
    const templateID = "template_yc1y55s";
    // sendForm accepts form element or form selector
    const res = await emailjs.sendForm(serviceID, templateID, "#contactForm");
    out.style.color = "green";
    out.textContent = "Message sent! Thank you — we will contact you soon.";
    form.reset();
    return true;
  } catch (err) {
    console.error("EmailJS error:", err);
    out.style.color = "crimson";
    out.textContent = "Send failed. Try again later.";
    return false;
  }
}
