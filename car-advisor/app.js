/* ============================================================
   AutóTanács — frontend logika
   ------------------------------------------------------------
   DEMÓ mód (alapértelmezett): a böngésző számol egy tájékoztató
     kockázati elemzést + kereső-linkeket. Nem kell hozzá szerver.
   ÉLES AI mód: ha az API_URL be van állítva, a valódi Claude AI-t
     hívja, ami fórumokból kutat típushibákat és értelmezi a szabad
     szöveget. Lásd README.md.
   ============================================================ */

// 👇 Ha van élő backended, ide írd a címét, pl. "https://autotanacs.vercel.app/api/analyze"
const API_URL = "";

/* ---- Hero videó: csökkentett mozgás esetén megáll, a poszter marad ---- */
(function () {
  const v = document.getElementById("heroVideo");
  if (!v) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    v.removeAttribute("autoplay");
    v.pause();
  }
  // Ha az autoplay-t a böngésző blokkolja, csendben maradunk a poszternél
  const p = v.play();
  if (p && typeof p.catch === "function") p.catch(() => {});
})();

/* ---- Topbar: a hero fölött átlátszó, alatta testet kap ---- */
const topbar = document.getElementById("topbar");
const heroEl = document.querySelector(".hero");
function syncTopbar() {
  const limit = (heroEl ? heroEl.offsetHeight : 400) - 90;
  topbar.classList.toggle("topbar--over", window.scrollY < limit);
}
window.addEventListener("scroll", syncTopbar, { passive: true });
window.addEventListener("resize", syncTopbar);
syncTopbar();

/* ---- Fül-sáv: az épp látott szakaszt jelöli ---- */
const tabs = Array.from(document.querySelectorAll("a.tab"));
if (tabs.length) {
  const targets = tabs
    .map((t) => ({ tab: t, el: document.querySelector(t.getAttribute("href")) }))
    .filter((x) => x.el);
  const markActive = () => {
    let current = targets[0];
    for (const t of targets) {
      if (t.el.getBoundingClientRect().top <= 140) current = t;
    }
    tabs.forEach((t) => t.classList.remove("is-active"));
    if (current) current.tab.classList.add("is-active");
  };
  window.addEventListener("scroll", markActive, { passive: true });
  markActive();
}

/* ---- Szakasz-animációk ---- */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

const form = document.getElementById("carForm");
const submitBtn = document.getElementById("submitBtn");
const resultEmpty = document.getElementById("resultEmpty");
const resultBody = document.getElementById("resultBody");
const modePill = document.getElementById("modePill");

modePill.textContent = API_URL ? "Élő AI" : "Demó mód";

/* ============================================================
   MODELL-ISMERŐ SZŰRŐK
   Ha a modell csak bizonyos kivitelben/üzemanyaggal/váltóval létezik,
   a többi opciót letiltjuk, hogy ne lehessen nem létező kombinációt
   megadni. Az első illeszkedő szabály érvényes, ezért a specifikusabb
   minta (pl. "kona electric") előbb szerepel, mint az általános ("kona").
   ISMERETLEN modellnél nem korlátozunk semmit.
   ============================================================ */
const SUV = ["SUV / Terepjáró"];
const HATCH = ["Ferdehátú"];
const EV = { fuels: ["Elektromos"], gearboxes: ["Automata"] };
const EV_NOTE = "Ez a modell kizárólag elektromos, egyfokozatú automata hajtással készül.";

/* A `years: [tól, ig]` a modell gyártási időszaka (ig = null → ma is gyártják).
   Csak akkor adjuk meg, ha biztosak vagyunk benne — inkább hallgatunk, mint
   tévesen figyelmeztetünk. */
const MODEL_RULES = [
  // --- Tisztán elektromos modellek ---
  { m: /tesla\s*model\s*3/, ...EV, bodyTypes: ["Sedan / Limuzin"], years: [2017, null], note: EV_NOTE },
  { m: /tesla\s*model\s*y/, ...EV, bodyTypes: SUV, years: [2020, null], note: EV_NOTE },
  { m: /tesla\s*model\s*s/, ...EV, years: [2012, null], note: EV_NOTE },
  { m: /tesla\s*model\s*x/, ...EV, bodyTypes: SUV, years: [2015, null], note: EV_NOTE },
  { m: /^tesla/, ...EV, years: [2012, null], note: EV_NOTE },
  { m: /(vw|volkswagen)\s*id\.?\s*3/, ...EV, bodyTypes: HATCH, years: [2020, null], note: EV_NOTE },
  { m: /(vw|volkswagen)\s*id\.?\s*[45]/, ...EV, bodyTypes: SUV, years: [2021, null], note: EV_NOTE },
  { m: /(vw|volkswagen)\s*id/, ...EV, years: [2020, null], note: EV_NOTE },
  { m: /nissan\s*leaf|^leaf/, ...EV, bodyTypes: HATCH, years: [2010, null], note: EV_NOTE },
  { m: /ioniq\s*5/, ...EV, years: [2021, null], note: EV_NOTE },
  { m: /ioniq\s*6/, ...EV, years: [2022, null], note: EV_NOTE },
  { m: /kona\s*electric/, ...EV, bodyTypes: SUV, years: [2018, null], note: EV_NOTE },
  { m: /kia\s*ev\s*6/, ...EV, years: [2021, null], note: EV_NOTE },
  { m: /kia\s*ev\s*9/, ...EV, bodyTypes: SUV, years: [2023, null], note: EV_NOTE },
  { m: /enyaq/, ...EV, bodyTypes: SUV, years: [2021, null], note: EV_NOTE },
  { m: /zoe/, ...EV, bodyTypes: HATCH, years: [2012, null], note: EV_NOTE },
  { m: /megane\s*e/, ...EV, years: [2022, null], note: EV_NOTE },
  { m: /bmw\s*i3|^i3\b/, ...EV, bodyTypes: HATCH, years: [2013, 2022], note: EV_NOTE },
  { m: /bmw\s*i4|^i4\b/, ...EV, years: [2021, null], note: EV_NOTE },
  { m: /bmw\s*ix|^ix\b/, ...EV, bodyTypes: SUV, years: [2021, null], note: EV_NOTE },
  { m: /q4\s*e[- ]?tron/, ...EV, bodyTypes: SUV, years: [2021, null], note: EV_NOTE },
  { m: /e[- ]?tron/, ...EV, years: [2019, null], note: EV_NOTE },
  { m: /mercedes.*\beq|^eq[a-z]/, ...EV, years: [2019, null], note: EV_NOTE },
  { m: /taycan/, ...EV, years: [2019, null], note: EV_NOTE },
  { m: /dacia\s*spring/, ...EV, bodyTypes: SUV, years: [2021, null], note: EV_NOTE },
  { m: /born/, ...EV, bodyTypes: HATCH, years: [2021, null], note: EV_NOTE },
  { m: /polestar/, ...EV, years: [2019, null], note: EV_NOTE },
  { m: /fiat\s*500\s*e|500e/, ...EV, bodyTypes: HATCH, years: [2020, null], note: EV_NOTE },
  { m: /\bmg\s*4\b/, ...EV, bodyTypes: HATCH, years: [2022, null], note: EV_NOTE },

  // --- Tisztán hibrid modellek (eCVT = automata) ---
  { m: /prius/, fuels: ["Hibrid"], gearboxes: ["Automata"], bodyTypes: HATCH, years: [1997, null],
    note: "A Prius kizárólag hibrid, eCVT automata hajtással készül." },

  // --- Csak automata váltóval (hagyományos motorral) ---
  { m: /grand\s*cherokee/, gearboxes: ["Automata"], bodyTypes: SUV, drivetrains: ["Összkerék"],
    years: [1992, null], note: "A Grand Cherokee csak automata váltóval és összkerékhajtással készült." },
  { m: /range\s*rover(?!\s*evoque)/, gearboxes: ["Automata"], bodyTypes: SUV, drivetrains: ["Összkerék"],
    note: "A Range Rover csak automata váltóval és összkerékhajtással készült." },

  // --- SUV-ok (kivitel kötött) ---
  { m: /t-roc/, bodyTypes: SUV, years: [2017, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /t-cross/, bodyTypes: SUV, years: [2019, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /tiguan/, bodyTypes: SUV, years: [2007, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /touareg/, bodyTypes: SUV, years: [2002, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /kodiaq/, bodyTypes: SUV, years: [2016, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /karoq/, bodyTypes: SUV, years: [2017, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /kamiq/, bodyTypes: SUV, years: [2019, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /tucson/, bodyTypes: SUV, years: [2004, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /santa\s*fe/, bodyTypes: SUV, years: [2000, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /sportage/, bodyTypes: SUV, years: [1993, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /sorento/, bodyTypes: SUV, years: [2002, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /qashqai/, bodyTypes: SUV, years: [2006, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /x-trail/, bodyTypes: SUV, years: [2000, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /juke/, bodyTypes: SUV, years: [2010, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /rav\s*4|rav4/, bodyTypes: SUV, years: [1994, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /c-hr|\bchr\b/, bodyTypes: SUV, years: [2016, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /cr-v/, bodyTypes: SUV, years: [1995, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /hr-v/, bodyTypes: SUV, years: [1999, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /mazda\s*cx|^cx-\d/, bodyTypes: SUV, years: [2006, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /kuga/, bodyTypes: SUV, years: [2008, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /ford\s*puma/, bodyTypes: SUV, years: [2019, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /mokka/, bodyTypes: SUV, years: [2012, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /grandland/, bodyTypes: SUV, years: [2017, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /crossland/, bodyTypes: SUV, years: [2017, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /\b2008\b/, bodyTypes: SUV, years: [2013, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /\b3008\b/, bodyTypes: SUV, years: [2008, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /\b5008\b/, bodyTypes: SUV, years: [2009, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /aircross/, bodyTypes: SUV, years: [2017, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /duster/, bodyTypes: SUV, years: [2010, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /captur/, bodyTypes: SUV, years: [2013, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /kadjar/, bodyTypes: SUV, years: [2015, 2022], note: "Ez a modell SUV kivitelben készül." },
  { m: /austral/, bodyTypes: SUV, years: [2022, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /bmw\s*x7|^x7\b/, bodyTypes: SUV, years: [2018, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /bmw\s*x[1-6]|^x[1-6]\b/, bodyTypes: SUV, note: "Ez a modell SUV kivitelben készül." },
  { m: /audi\s*q[1-8]|^q[1-8]\b/, bodyTypes: SUV, note: "Ez a modell SUV kivitelben készül." },
  { m: /\b(gla|glb|glc|gle|gls)\b/, bodyTypes: SUV, note: "Ez a modell SUV kivitelben készül." },
  { m: /volvo\s*xc|^xc\d/, bodyTypes: SUV, note: "Ez a modell SUV kivitelben készül." },
  { m: /vitara/, bodyTypes: SUV, years: [1988, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /s-cross/, bodyTypes: SUV, years: [2013, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /forester/, bodyTypes: SUV, years: [1997, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /outlander/, bodyTypes: SUV, years: [2001, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /\basx\b/, bodyTypes: SUV, years: [2010, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /eclipse\s*cross/, bodyTypes: SUV, years: [2017, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /cayenne/, bodyTypes: SUV, years: [2002, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /macan/, bodyTypes: SUV, years: [2014, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /ateca/, bodyTypes: SUV, years: [2016, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /arona/, bodyTypes: SUV, years: [2017, null], note: "Ez a modell SUV kivitelben készül." },
  { m: /defender|wrangler/, bodyTypes: SUV, drivetrains: ["Összkerék"],
    note: "Terepjáró: összkerékhajtással készül." },

  // --- Kisautók: csak ferdehátú ---
  { m: /\bpolo\b/, bodyTypes: HATCH, years: [1975, null], note: "Ez a modell ferdehátú kivitelben készül." },
  { m: /\bup!?\b/, bodyTypes: HATCH, years: [2011, 2023], note: "Ez a modell ferdehátú kivitelben készül." },
  { m: /fiesta/, bodyTypes: HATCH, years: [1976, 2023], note: "Ez a modell ferdehátú kivitelben készül." },
  { m: /corsa/, bodyTypes: HATCH, years: [1982, null], note: "Ez a modell ferdehátú kivitelben készül." },
  { m: /\bclio\b/, bodyTypes: HATCH, years: [1990, null], note: "Ez a modell ferdehátú kivitelben készül." },
  { m: /yaris(?!\s*cross)/, bodyTypes: HATCH, years: [1999, null], note: "Ez a modell ferdehátú kivitelben készül." },
  { m: /swift/, bodyTypes: HATCH, years: [1983, null], note: "Ez a modell ferdehátú kivitelben készül." },
  { m: /\bjazz\b/, bodyTypes: HATCH, years: [2001, null], note: "Ez a modell ferdehátú kivitelben készül." },
  { m: /micra/, bodyTypes: HATCH, years: [1982, null], note: "Ez a modell ferdehátú kivitelben készül." },
  { m: /\bpanda\b/, bodyTypes: HATCH, years: [1980, null], note: "Ez a modell ferdehátú kivitelben készül." },
  { m: /\bi10\b/, bodyTypes: HATCH, years: [2007, null], note: "Ez a modell ferdehátú kivitelben készül." },
  { m: /\bi20\b/, bodyTypes: HATCH, years: [2008, null], note: "Ez a modell ferdehátú kivitelben készül." },
  { m: /picanto/, bodyTypes: HATCH, years: [2004, null], note: "Ez a modell ferdehátú kivitelben készül." },
  { m: /\baygo\b/, bodyTypes: HATCH, years: [2005, null], note: "Ez a modell ferdehátú kivitelben készül." },
  { m: /twingo/, bodyTypes: HATCH, years: [1992, null], note: "Ez a modell ferdehátú kivitelben készül." },
  { m: /\b(108|208)\b/, bodyTypes: HATCH, note: "Ez a modell ferdehátú kivitelben készül." },

  // --- Ferdehátú + kombi ---
  { m: /\bgolf\b(?!\s*plus)/, bodyTypes: ["Ferdehátú", "Kombi"], years: [1974, null],
    note: "Ez a modell ferdehátú és kombi (Variant) kivitelben készül." },
  { m: /astra/, bodyTypes: ["Ferdehátú", "Kombi"], years: [1991, null],
    note: "Ez a modell ferdehátú és kombi kivitelben készül." },
  { m: /focus/, bodyTypes: ["Ferdehátú", "Kombi"], years: [1998, null],
    note: "Ez a modell ferdehátú és kombi kivitelben készül." },
  { m: /megane(?!\s*e)/, bodyTypes: ["Ferdehátú", "Kombi"], years: [1995, null],
    note: "Ez a modell ferdehátú és kombi kivitelben készül." },
  { m: /civic/, bodyTypes: ["Ferdehátú", "Sedan / Limuzin"], years: [1972, null],
    note: "Ez a modell ferdehátú és sedan kivitelben készül." },
  { m: /\b308\b/, bodyTypes: ["Ferdehátú", "Kombi"], years: [2007, null],
    note: "Ez a modell ferdehátú és kombi kivitelben készül." },

  // --- Sedan + kombi ---
  { m: /octavia/, bodyTypes: ["Sedan / Limuzin", "Kombi"], years: [1996, null],
    note: "Ez a modell sedan (liftback) és kombi kivitelben készül." },
  { m: /superb/, bodyTypes: ["Sedan / Limuzin", "Kombi"], years: [2001, null],
    note: "Ez a modell sedan és kombi kivitelben készül." },
  { m: /passat/, bodyTypes: ["Sedan / Limuzin", "Kombi"], years: [1973, null],
    note: "Ez a modell sedan és kombi kivitelben készül." },
  { m: /mondeo/, bodyTypes: ["Sedan / Limuzin", "Kombi"], years: [1993, 2022],
    note: "Ez a modell sedan és kombi kivitelben készül." },
  { m: /insignia/, bodyTypes: ["Sedan / Limuzin", "Kombi"], years: [2008, 2022],
    note: "Ez a modell sedan és kombi kivitelben készül." },
  { m: /\b508\b/, bodyTypes: ["Sedan / Limuzin", "Kombi"], years: [2010, null],
    note: "Ez a modell sedan és kombi kivitelben készül." },
];

/* ============================================================
   MÁRKA → MODELL → MOTOR legördülők (fleet.js adatbázisából)
   ------------------------------------------------------------
   A három mező egymásra épül: a modell csak az adott márkáé lehet,
   a motor pedig csak az adott modellhez ÉS évjárathoz létező.
   Így nem lehet nem létező kombinációt megadni.
   A kiválasztott hármasból összeállítjuk a rejtett `model` mezőt
   ("Volkswagen Golf 1.9 PD TDI"), amit a tudásbázis felismer.
   ============================================================ */
const brandSel = document.getElementById("brandSel");
const modelSel = document.getElementById("modelSel");
const engineSel = document.getElementById("engineSel");
const modelHidden = document.getElementById("modelHidden");
const hasFleet = typeof FLEET !== "undefined" && brandSel && modelSel && engineSel;

function fillSelect(sel, items, placeholder) {
  sel.innerHTML = "";
  const ph = document.createElement("option");
  ph.value = ""; ph.textContent = placeholder;
  sel.appendChild(ph);
  items.forEach((it) => {
    const o = document.createElement("option");
    if (typeof it === "string") { o.value = it; o.textContent = it; }
    else { o.value = it.value; o.textContent = it.text; if (it.data) Object.assign(o.dataset, it.data); }
    sel.appendChild(o);
  });
}

if (hasFleet) {
  fillSelect(brandSel, fleetBrands(), "Válassz márkát…");

  brandSel.addEventListener("change", () => {
    const models = brandSel.value ? fleetModels(brandSel.value) : [];
    fillSelect(modelSel, models, brandSel.value ? "Válassz modellt…" : "Előbb a márkát…");
    modelSel.disabled = !models.length;
    refreshEngines();
    syncModelField();
  });

  modelSel.addEventListener("change", () => { applyModelSpan(); refreshEngines(); syncModelField(); });
  engineSel.addEventListener("change", syncModelField);
}

/* A modell gyártási időszakára szorítjuk az évjárat mezőt. */
function applyModelSpan() {
  if (!hasFleet) return;
  const span = brandSel.value && modelSel.value ? fleetModelYears(brandSel.value, modelSel.value) : null;
  const yEl = form.elements.year;
  yEl.min = span ? span[0] : 1990;
  yEl.max = span ? Math.min(span[1], 2026) : 2026;
  const note = document.getElementById("modelNote");
  if (span) {
    const y = Number(yEl.value);
    if (y && (y < span[0] || y > span[1])) {
      yEl.value = "";                      // a modellhez nem létező évjárat
    }
    note.textContent = `ℹ️ ${modelSel.value}: gyártás ${span[0]}–${span[1] >= 2024 ? "napjainkig" : span[1]}.`;
    note.hidden = false;
  } else if (note) {
    note.hidden = true;
  }
}

function refreshEngines() {
  if (!hasFleet) return;
  const year = Number(form.elements.year.value) || null;
  const list = brandSel.value && modelSel.value
    ? fleetEngines(brandSel.value, modelSel.value, year) : [];
  const prev = engineSel.value;
  fillSelect(
    engineSel,
    list.map((e) => ({
      value: e.code,
      text: e.label,
      data: { fuel: e.fuel, gearboxes: e.gearboxes.join(","), hp: String(e.hp) },
    })),
    !modelSel.value ? "Előbb a modellt…"
      : !year ? "Add meg az évjáratot…"
      : list.length ? "Válassz motort…" : "Ehhez az évjárathoz nincs adatunk"
  );
  engineSel.disabled = !list.length;
  if (list.some((e) => e.code === prev)) engineSel.value = prev;
  syncFuelGearboxFromEngine();
}

/* A választott motorból következik az üzemanyag és a lehetséges váltók.
   FIGYELEM: a select-et sosem tiltjuk le (a letiltott mező kimarad a
   FormData-ból), csak a nem létező opciókat. */
function syncFuelGearboxFromEngine() {
  if (!hasFleet) return;
  const opt = engineSel.selectedOptions[0];
  const fuelSel = form.elements.fuel, gbSel = form.elements.gearbox;
  if (!opt || !opt.value) {
    Array.from(fuelSel.options).forEach((o) => (o.disabled = false));
    Array.from(gbSel.options).forEach((o) => (o.disabled = false));
    fuelSel.classList.remove("locked"); gbSel.classList.remove("locked");
    return;
  }
  const fuel = opt.dataset.fuel;
  Array.from(fuelSel.options).forEach((o) => (o.disabled = o.value !== fuel));
  fuelSel.value = fuel;
  fuelSel.classList.add("locked");

  const allowed = (opt.dataset.gearboxes || "").split(",").filter(Boolean);
  Array.from(gbSel.options).forEach((o) => (o.disabled = allowed.length ? !allowed.includes(o.value) : false));
  if (allowed.length && !allowed.includes(gbSel.value)) gbSel.value = allowed[0];
  gbSel.classList.toggle("locked", allowed.length === 1);
}

/* A rejtett `model` mező tartalma: "Márka Modell Motor" */
function syncModelField() {
  if (!hasFleet || !modelHidden) return;
  modelHidden.value = [brandSel.value, modelSel.value, engineSel.value].filter(Boolean).join(" ");
}

const selects = {
  fuel: form.elements.fuel,
  gearbox: form.elements.gearbox,
  bodyType: form.elements.bodyType,
};
// Az eredeti opciólistát elmentjük, hogy visszaállítható legyen
const ORIGINAL = {};
Object.entries(selects).forEach(([k, sel]) => {
  ORIGINAL[k] = Array.from(sel.options).map((o) => o.value);
});
const modelNote = document.getElementById("modelNote");
/* A hajtás és szervizkönyv mezők kikerültek az űrlapról; a szabályokban maradó
   `drivetrains` kulcsokat egyszerűen nem alkalmazzuk (nincs hozzá mező). */
const RULE_KEYS = { fuels: "fuel", gearboxes: "gearbox", bodyTypes: "bodyType" };
const FORCED = new Set(); // mely mezők értékét kényszerítette szabály

function findRule(text) {
  const t = String(text || "").toLowerCase().trim();
  if (t.length < 3) return null;
  return MODEL_RULES.find((r) => r.m.test(t)) || null;
}

const yearInput = form.elements.year;
const yearNote = document.getElementById("yearNote");
let activeRule = null;

/* Évjárat-ellenőrzés: a modell gyártási időszakán kívüli év nem érvényes. */
function checkYear() {
  const y = Number(yearInput.value);
  const span = activeRule && activeRule.years;
  if (!span || !y) { yearNote.hidden = true; yearInput.setCustomValidity(""); return true; }
  const [from, to] = span;
  const until = to || 2026;
  if (y < from || y > until) {
    const range = to ? `${from}–${to}` : `${from}-tól`;
    const msg = `Ez a modell ${range} készült — a ${y} nem létező évjárat hozzá.`;
    yearNote.textContent = "⚠️ " + msg;
    yearNote.hidden = false;
    yearInput.setCustomValidity(msg);
    return false;
  }
  yearNote.hidden = true;
  yearInput.setCustomValidity("");
  return true;
}

function applyModelRules() {
  const rule = findRule(form.elements.model.value);
  activeRule = rule;
  /* A legördülős módban a motor már meghatározza az üzemanyagot és a váltót,
     az évjárat-korlátot pedig a modell gyártási időszaka adja — a régi
     szöveges szabályokból itt csak a KIVITEL (bodyType) szűrése marad. */
  if (hasFleet) {
    applyModelSpan();
    Array.from(selects.bodyType.options).forEach((o) => (o.disabled = false));
    selects.bodyType.classList.remove("locked");
    if (rule && rule.bodyTypes) {
      let first = null;
      Array.from(selects.bodyType.options).forEach((o) => {
        const ok = o.value === "" || rule.bodyTypes.includes(o.value);
        o.disabled = !ok;
        if (ok && o.value && first === null) first = o.value;
      });
      if (selects.bodyType.value && !rule.bodyTypes.includes(selects.bodyType.value) && first) {
        selects.bodyType.value = first;
      }
      if (rule.bodyTypes.length === 1) selects.bodyType.classList.add("locked");
    }
    syncFuelGearboxFromEngine();
    return;
  }

  // 1) Mindent visszaállítunk alapállapotba
  Object.entries(selects).forEach(([key, sel]) => {
    Array.from(sel.options).forEach((o) => (o.disabled = false));
    sel.disabled = false;
    sel.classList.remove("locked");
  });
  yearInput.min = 1990;
  yearInput.max = 2026;

  // Ha egy korábbi szabály kényszerített egy értéket, és az új modellnél ez már
  // nem kötelező, visszaállítjuk alapértékre (különben pl. a Prius után a Golf
  // is "Hibrid"-en maradna).
  Object.entries(RULE_KEYS).forEach(([ruleKey, selKey]) => {
    if (!FORCED.has(selKey)) return;
    const stillRequired = rule && rule[ruleKey] && rule[ruleKey].includes(selects[selKey].value);
    if (!stillRequired) {
      selects[selKey].value = ORIGINAL[selKey][0];
      FORCED.delete(selKey);
    }
  });

  if (!rule) { modelNote.hidden = true; checkYear(); return; }

  // Évjárat-korlát a modell gyártási időszakára
  if (rule.years) {
    yearInput.min = rule.years[0];
    yearInput.max = rule.years[1] || 2026;
  }
  checkYear();

  // 2) Alkalmazzuk a szabályt: a nem létező opciókat letiltjuk
  let changed = false;
  Object.entries(RULE_KEYS).forEach(([ruleKey, selKey]) => {
    const allowed = rule[ruleKey];
    if (!allowed) return;
    const sel = selects[selKey];
    let firstAllowed = null;
    Array.from(sel.options).forEach((o) => {
      const isEmpty = o.value === "";        // a "—" mindig maradhat
      const ok = isEmpty || allowed.includes(o.value);
      o.disabled = !ok;
      if (ok && !isEmpty && firstAllowed === null) firstAllowed = o.value;
    });
    // Ha az aktuális választás érvénytelen lett, átállítjuk
    if (sel.value && !allowed.includes(sel.value) && firstAllowed) {
      sel.value = firstAllowed;
      FORCED.add(selKey);
      changed = true;
    }
    // Egyetlen lehetőség → vizuálisan zároljuk.
    // FIGYELEM: NEM állítunk sel.disabled = true-t, mert a letiltott mező
    // értéke nem kerül bele a FormData-ba (elveszne pl. az üzemanyag).
    // A többi opció letiltása miatt más nem választható.
    if (allowed.length === 1) {
      if (!sel.value || sel.value === "") sel.value = allowed[0];
      sel.classList.add("locked");
      FORCED.add(selKey);
    }
  });

  let note = rule.note;
  if (rule.years) {
    note += ` Gyártás: ${rule.years[0]}–${rule.years[1] || "napjainkig"}.`;
  }
  modelNote.textContent = "ℹ️ " + note + (changed ? " A választást ehhez igazítottuk." : "");
  modelNote.hidden = false;
}

/* A `model` mező mostantól rejtett és a három legördülőből áll össze, ezért
   nem ő kapja a beírás-eseményt — a legördülők változásakor futtatjuk a
   szabályokat. Az évjárat változása újraszűri a motorlistát is. */
if (hasFleet) {
  [brandSel, modelSel, engineSel].forEach((sel) =>
    sel.addEventListener("change", () => { syncModelField(); applyModelRules(); })
  );
  yearInput.addEventListener("input", () => { refreshEngines(); syncModelField(); checkYear(); });
  yearInput.addEventListener("change", () => { refreshEngines(); syncModelField(); });
} else {
  form.elements.model.addEventListener("input", applyModelRules);
  form.elements.model.addEventListener("change", applyModelRules);
  yearInput.addEventListener("input", checkYear);
}
applyModelRules();

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  // Nem létező kombinációval nem indulunk el
  if (typeof checkYear === "function" && !checkYear()) {
    form.elements.year.focus();
    form.elements.year.reportValidity();
    return;
  }
  const d = Object.fromEntries(new FormData(form).entries());
  d.year = Number(d.year);
  d.km = Number(d.km);
  d.price = Number(d.price);
  d.powerHp = d.powerHp ? Number(d.powerHp) : null;

  showLoading();
  submitBtn.disabled = true;
  try {
    const analysis = API_URL ? await callRealAI(d) : demoAnalyze(d);
    renderResult(analysis, d, !API_URL);
  } catch (err) {
    renderError(err);
  } finally {
    submitBtn.disabled = false;
  }
});

/* -------- ÉLES AI hívás -------- */
async function callRealAI(d) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(d),
  });
  if (!res.ok) throw new Error("A szerver hibát adott (" + res.status + ").");
  return await res.json();
}

/* -------- Kereső-linkek (deep link) -------- */
function slug(s) {
  return String(s || "").toLowerCase().normalize("NFD")
    .replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
/* A hasznaltauto.hu a szűrőket kódolt tokenbe csomagolja (talalatilista/auto/2G4ZLM...),
   ezért kézzel csak a márka/modell szintű lista építhető megbízhatóan. Az évjárat/üzemanyag
   szűrőt ott a felhasználó egy kattintással beállítja. A mobile.de-n viszont valódi
   query-paraméterek vannak, ott mindent leszűrünk. */
function hasznaltautoUrl(d) {
  const parts = String(d.model || "").trim().split(/\s+/);
  const brand = slug(parts[0]);
  const model = parts[1] ? slug(parts[1]) : "";
  if (!brand) return "https://www.hasznaltauto.hu/";
  return model
    ? `https://www.hasznaltauto.hu/szemelyauto/${brand}/${model}`
    : `https://www.hasznaltauto.hu/szemelyauto/${brand}`;
}

/* mobile.de márka-ID-k (a keresés csak ezekkel szűr márkára) */
const MOBILE_MAKE_IDS = {
  audi: 1900, bmw: 3500, citroen: 5600, dacia: 6600, fiat: 8800, ford: 9000,
  honda: 11000, hyundai: 11600, jeep: 13200, kia: 13950, lexus: 14400,
  mazda: 16800, mercedes: 17200, "mercedes-benz": 17200, mini: 17500,
  mitsubishi: 17700, nissan: 18700, opel: 19000, peugeot: 19300, porsche: 20100,
  renault: 20700, seat: 22500, skoda: 22900, subaru: 23100, suzuki: 23500,
  tesla: 135000, toyota: 24100, volkswagen: 25200, vw: 25200, volvo: 25100,
  alfa: 300, "alfa-romeo": 300, chevrolet: 5000, dodge: 6800, jaguar: 13100,
  "land-rover": 14200, saab: 22000, smart: 23000, ssangyong: 22800, cupra: 141,
};
const MOBILE_FUELS = {
  "Benzin": "PETROL", "Dízel": "DIESEL", "Hibrid": "HYBRID",
  "Elektromos": "ELECTRICITY", "LPG / gáz": "LPG",
};

function mobiledeUrl(d) {
  const parts = String(d.model || "").trim().split(/\s+/);
  const brandKey = slug(parts[0]);
  const makeId = MOBILE_MAKE_IDS[brandKey];
  const modelDesc = parts.slice(1).join(" ").trim();

  const p = new URLSearchParams();
  p.set("isSearchRequest", "true");
  p.set("s", "Car");
  p.set("vc", "Car");

  if (makeId) {
    p.set("makeModelVariant1.makeId", String(makeId));
    if (modelDesc) p.set("makeModelVariant1.modelDescription", modelDesc);
  } else {
    // Ismeretlen márka: szabad szavas keresés (kevésbé pontos, de működik)
    p.set("ms", ";;;" + String(d.model || "").trim());
  }

  const fuel = MOBILE_FUELS[d.fuel];
  if (fuel) p.set("fuels", fuel);

  if (d.year) {
    // Konkrét autónál ±1 év a szórás; ajánlásnál kapunk egy tól–ig sávot
    const to = d.yearTo || d.year + 1;
    p.set("minFirstRegistrationDate", `${d.year - (d.yearTo ? 0 : 1)}-01-01`);
    p.set("maxFirstRegistrationDate", `${to}-12-31`);
  }
  if (d.km) p.set("maxMileage", String(Math.round(d.km * 1.3)));
  if (d.maxPrice) p.set("maxPrice", String(Math.round(d.maxPrice / 400))); // Ft → EUR közelítés
  if (d.gearbox === "Automata") p.set("transmissions", "AUTOMATIC_GEAR");
  else if (d.gearbox === "Manuális") p.set("transmissions", "MANUAL_GEAR");

  return "https://suchen.mobile.de/fahrzeuge/search.html?" + p.toString();
}

/* -------- DEMÓ elemzés -------- */
function demoAnalyze(d) {
  const now = 2026;
  const age = Math.max(now - d.year, 0);
  const kmPerYear = age > 0 ? Math.round(d.km / age) : d.km;

  let risk = 15;
  if (d.km > 200000) risk += 25; else if (d.km > 150000) risk += 15; else if (d.km > 100000) risk += 8;
  if (age > 15) risk += 20; else if (age > 10) risk += 12; else if (age > 6) risk += 5;
  if (kmPerYear > 25000) risk += 12; else if (kmPerYear < 6000 && age > 3) risk += 8;
  if (d.fuel === "Dízel" && d.usage === "városi") risk += 12;
  if (d.gearbox === "Automata" && age > 10) risk += 6;
  if (d.condition === "Közepes") risk += 8; else if (d.condition === "Felújítandó") risk += 18;
  risk = Math.max(5, Math.min(95, risk));

  let verdict, tone;
  if (risk < 35) { verdict = "Alacsony kockázat"; tone = "good"; }
  else if (risk < 60) { verdict = "Megfontolandó"; tone = "warn"; }
  else { verdict = "Fokozott kockázat"; tone = "bad"; }

  const issues = [];
  if (d.fuel === "Dízel" && d.usage === "városi")
    issues.push({ title: "Dízel + városi használat", detail: "A részecskeszűrő (DPF) és az EGR-szelep városban hajlamos eltömődni." });
  if (d.km > 150000)
    issues.push({ title: "Magas futásteljesítmény", detail: "Vezérlés, kuplung, futómű kopóalkatrészei gyakran cserére érnek." });
  if (age > 10)
    issues.push({ title: "Kor miatti kopás", detail: "Tömítések, szíjak, akkumulátor és rozsdásodás a jellemző pontok." });
  if (d.gearbox === "Automata")
    issues.push({ title: "Automata váltó", detail: "Kérdezz rá az olajcserére; a javítás drága lehet." });
  if (issues.length === 0)
    issues.push({ title: "Nincs kiugró kockázat az adatokból", detail: "A konkrét darab állapota dönt — nézesd meg alaposan." });

  const known = detectKnown(d);
  const fc = buildForecast(d);
  const mainRisk = pickMainRisk(fc, d.km);

  return {
    verdict, tone, riskScore: risk,
    forecast: fc,
    mainRisk,
    known,
    review:
      "🔒 A szabad szöveg értelmezése és a személyre szabott vélemény az ÉLES AI módban készül. " +
      (d.freeText ? "Amit beírtál, azt ott dolgozza fel az AI." : "Írj a szabad szöveg mezőbe, hogy az AI véleményezhesse."),
    priceAssessment:
      "Az ár valós piaci értékeléséhez élő AI és friss hirdetési adat kell. " +
      "Tipp: hasonlítsd össze ugyanezt a modellt/évjáratot/km-et több hirdetésben (lásd a gombokat lent).",
    knownIssues: issues,
    maintenance: [
      "Kérj szerviztörténetet és nézd meg, mikor cseréltek vezérlést / szíjat.",
      "Ellenőrizd az olaj- és folyadékszinteket, a gumik korát és kopását.",
    ],
    checklist: buildChecklist(d),
    fitForNeeds: fitText(d),
    summary: `${d.model} (${d.year}, ${d.km.toLocaleString("hu-HU")} km): kb. ${kmPerYear.toLocaleString("hu-HU")} km/év. Kockázati szint: ${verdict.toLowerCase()}.`,
  };
}

/* Km-alapú előrejelzés: mi esedékes / mi romolhat el a következő ~50e km-ben.
   SZÁNDÉKOSAN kihagyjuk a rutin fogyóeszközöket (olajcsere, szűrők, fékbetét,
   gyertya, folyadékok) — azok kis összegűek és nem befolyásolják a vételi döntést.
   Csak a pénztárcát vagy a motort érdemben érintő tételek kerülnek be. */
function buildForecast(d) {
  const km = d.km;
  const age = Math.max(2026 - d.year, 0);
  const F = [];
  const push = (cond, o) => { if (cond) F.push(o); };

  /* ===== 1) MODELL/MOTOR-SPECIFIKUS tételek a tudásbázisból =====
     A motort a modell mezőből ÉS a szabad szövegből próbáljuk felismerni
     (pl. „Volkswagen Golf 1.9 TDI” vagy a bemásolt hirdetés szövege). */
  const hay = `${d.model || ""} ${d.freeText || ""}`;
  const hits = [
    ...(typeof KB_ENGINES !== "undefined" ? kbMatch(KB_ENGINES, hay) : []),
    ...(typeof KB_GEARBOXES !== "undefined" ? kbMatch(KB_GEARBOXES, hay) : []),
  ];
  hits.forEach((entry) => {
    entry.faults.forEach((f) => {
      if (km < f.from - 20000) return; // még messze van, ne ijesztgessünk
      F.push({
        title: f.title,
        kind: "meghibásodás",
        urgency: km >= f.from + 60000 ? "esedékes" : km >= f.from ? "hamarosan" : "figyeld",
        detail: `${entry.name} — ${f.detail}`,
        estCost: f.cost,
        specific: true,
        sev: f.sev,
        from: f.from,
        engine: entry.name,
      });
    });
  });

  /* Ha felismertük a MOTORT, az általános vezérlés-tételeket kihagyjuk: a
     tudásbázis pontosan tudja, hogy az adott motorban szíj van-e vagy lánc.
     Enélkül szíjcserét írnánk ki láncos motorra is — pont az a fajta
     általánosság, amit el akarunk kerülni. */
  const knownEngine = (typeof KB_ENGINES !== "undefined") && kbMatch(KB_ENGINES, hay).length > 0;

  // --- Motor / hajtáslánc: a legdrágább kockázatok ---
  push(!knownEngine && km >= 70000, { title: "Vezérműszíj + vízpumpa csere", kind: "karbantartás",
    urgency: km >= 120000 ? "esedékes" : "hamarosan",
    detail: "Típusfüggő 60–120 e km-enként — és először azt kell tisztázni, hogy ez a motor szíjas-e vagy láncos. Ha szíjas: elmulasztva a szíj elszakad és TÖNKREMEGY a motor. Kérdezz rá, cserélték-e és mikor, kérj számlát.",
    estCost: "kb. 80–250 e Ft" });
  push(!knownEngine && km >= 120000, { title: "Vezérműlánc nyúlása (láncos motoroknál)", kind: "meghibásodás",
    urgency: km >= 180000 ? "esedékes" : "figyeld",
    detail: "Hidegindításkor csörgő/zörgő hang az árulkodó jel. Sok modellnél 150–250 e km körül jelentkezik, és a javítás motorbontással jár.",
    estCost: "kb. 200–700 e Ft" });
  /* A hibrid és az elektromos „automata” NEM hagyományos váltó: a Toyota-féle
     eCVT egy bolygóműves osztó, az elektromosban pedig egyfokozatú áttétel van.
     Nincs bennük kuplungcsomag és nincs DSG-szerű olajcsere-határidő — ezekre
     tehát nem szabad váltóolaj- vagy kuplungtételt kiírni. */
  const trueAuto = d.gearbox === "Automata" && d.fuel !== "Hibrid" && d.fuel !== "Elektromos";
  push(trueAuto, { title: "Automata / DSG váltóolaj csere", kind: "karbantartás",
    urgency: km >= 60000 ? "esedékes" : "figyeld",
    detail: "Sokan kihagyják — kihagyva a váltó tönkremehet, ami a legdrágább javítások egyike. Kérj rá dokumentumot.",
    estCost: "kb. 60–150 e Ft" });
  push(trueAuto && km >= 150000, { title: "Automata váltó / DSG kuplung felújítás", kind: "meghibásodás",
    urgency: km >= 200000 ? "esedékes" : "figyeld",
    detail: "Rángatás, késés, csúszás a jele. 150–250 e km felett reális kockázat.",
    estCost: "kb. 300–900 e Ft" });
  push(d.gearbox === "Manuális" && km >= 140000, { title: "Kuplung + kétsúlyú lendkerék (DMF)", kind: "meghibásodás",
    urgency: km >= 180000 ? "esedékes" : "figyeld",
    detail: "150–200 e km körül gyakran cserére szorul; a kétsúlyú lendkerék jelentősen drágítja.",
    estCost: "kb. 150–400 e Ft" });
  push(km >= 220000, { title: "Motor általános állapota (olajfogyás, kompresszió)", kind: "meghibásodás",
    urgency: "figyeld",
    detail: "Nagyon magas km-nél a dugattyúgyűrűk / hengerfej kopása olajfogyást és teljesítményvesztést okozhat. Kérj kompresszió-mérést.",
    estCost: "felújítás: 600 e – 2 M Ft" });

  // --- Üzemanyag-specifikus drága elemek ---
  push(d.fuel === "Dízel" && km >= 120000, { title: "Dízel: DPF (részecskeszűrő) eltömődés", kind: "meghibásodás",
    urgency: d.usage === "városi" ? "esedékes" : "figyeld",
    detail: "Városi, rövid utas használatnál nem tud regenerálódni. Tisztítás olcsóbb, csere drága.",
    estCost: "tisztítás 50–120 e Ft / csere 250–600 e Ft" });
  push(d.fuel === "Dízel" && km >= 130000, { title: "Dízel: EGR-szelep és turbó", kind: "meghibásodás",
    urgency: km >= 180000 ? "esedékes" : "figyeld",
    detail: "Kormos EGR és kifáradó turbó tipikus ebben a km-sávban; teljesítményvesztés, füstölés a jel.",
    estCost: "EGR 60–200 e Ft / turbó 200–600 e Ft" });
  push(d.fuel === "Dízel" && km >= 150000, { title: "Dízel: injektorok / adagoló", kind: "meghibásodás",
    urgency: "figyeld",
    detail: "Nehéz indítás, egyenetlen üresjárat, füstölés. Common rail injektor darabja is jelentős összeg.",
    estCost: "kb. 80–150 e Ft / injektor" });
  push(d.fuel === "Benzin" && km >= 150000, { title: "Katalizátor / lambdaszondák", kind: "meghibásodás",
    urgency: "figyeld",
    detail: "Hibás lambda vagy kimerült katalizátor miatt nem megy át a vizsgán; magas fogyasztás a jel.",
    estCost: "kb. 80–350 e Ft" });
  push((d.fuel === "Hibrid" || d.fuel === "Elektromos") && km >= 120000, { title: "Hajtásakkumulátor kapacitásvesztés", kind: "meghibásodás",
    urgency: km >= 200000 ? "esedékes" : "figyeld",
    detail: "A legdrágább alkatrész — MINDIG kérj akkumulátor-egészség (SoH) mérést vásárlás előtt.",
    estCost: "kb. 800 e – 4 M Ft" });

  // --- Futómű, kormányzás, elektronika ---
  push(km >= 130000, { title: "Lengéscsillapítók (tengelyenként)", kind: "meghibásodás",
    urgency: km >= 180000 ? "esedékes" : "figyeld",
    detail: "150–200 e km körül tipikusan kifáradnak: bizonytalan úttartás, bukdácsolás, egyenetlen gumikopás.",
    estCost: "kb. 100–250 e Ft" });
  push(km >= 140000, { title: "Futómű: szilentek, lengőkarok, csapágyak", kind: "meghibásodás",
    urgency: "figyeld",
    detail: "Kattogás, zaj, kormányba visszaadó rezgés. Több elem egyszerre is szokott cserére érni.",
    estCost: "kb. 100–300 e Ft (több elem)" });
  push(km >= 160000, { title: "Kormánymű / szervoszivattyú", kind: "meghibásodás",
    urgency: "figyeld",
    detail: "Kopogás kormányzáskor, folyás, nehéz kormányzás. Elektromos szervónál a motor cseréje drága.",
    estCost: "kb. 100–350 e Ft" });
  push(km >= 170000, { title: "Generátor / önindító", kind: "meghibásodás",
    urgency: "figyeld",
    detail: "180–250 e km körül tipikus kifáradás; nehéz indítás, töltési hiba a jel.",
    estCost: "kb. 60–200 e Ft" });
  push(age >= 10, { title: "Klímakompresszor / klímarendszer", kind: "meghibásodás",
    urgency: "figyeld",
    detail: "Idősebb autóknál a kompresszor vagy a kondenzátor gyakori hibapont — nyáron derül ki. Próbáld ki, hűt-e rendesen.",
    estCost: "kb. 100–350 e Ft" });

  // --- Karosszéria ---
  push(age >= 10, { title: "Rozsdásodás (küszöb, aljváz, fékcsövek)", kind: "meghibásodás",
    urgency: age >= 15 ? "esedékes" : "figyeld",
    detail: "Emeld fel és nézd meg alulról. Az átrozsdásodott fékcső vagy küszöb a műszakit is megbuktatja.",
    estCost: "javítás: 100 e – 1 M Ft" });

  // A modell-specifikus tételek kerüljenek előre — azok a fontosabbak
  F.sort((a, b) => (b.specific ? 1 : 0) - (a.specific ? 1 : 0));
  return F;
}

/* ===== A FŐ KOCKÁZAT kiválasztása =====
   Nem a leghosszabb listát akarjuk, hanem AZT az egy hibát, ami ennél az
   autónál és ennél a km-nél a legnagyobb tétet jelenti — és azt magyarázzuk
   el részletesen, hogy a felhasználó dönteni tudjon. */
function pickMainRisk(forecast, km) {
  let best = null, bestScore = -1;
  forecast.forEach((f) => {
    let s = 0;
    if (f.specific) s += 100;              // motor-specifikus > általános
    if (f.sev === "high") s += 60;         // súlyos következmény
    if (f.urgency === "esedékes") s += 30;
    else if (f.urgency === "hamarosan") s += 15;
    if (typeof f.from === "number" && km >= f.from) {
      s += Math.min((km - f.from) / 20000, 10); // minél régebb óta esedékes
    }
    if (typeof KB_DEEP !== "undefined" && KB_DEEP[f.title]) s += 40; // van mély magyarázatunk
    if (s > bestScore) { bestScore = s; best = f; }
  });
  if (!best) return null;
  const deep = (typeof KB_DEEP !== "undefined" && KB_DEEP[best.title]) || null;
  return { item: best, deep };
}

/* Mely motorokat/váltókat ismertük fel? (a válaszban megmutatjuk) */
function detectKnown(d) {
  const hay = `${d.model || ""} ${d.freeText || ""}`;
  const hits = [
    ...(typeof KB_ENGINES !== "undefined" ? kbMatch(KB_ENGINES, hay) : []),
    ...(typeof KB_GEARBOXES !== "undefined" ? kbMatch(KB_GEARBOXES, hay) : []),
  ];
  return { names: hits.map((h) => h.name), notes: hits.map((h) => h.note).filter(Boolean) };
}

function buildChecklist(d) {
  const base = [
    "Ellenőrizd a szerviztörténetet és a valós km-et (óracsere gyakori).",
    "Kérj független szakértői átvizsgálást vásárlás előtt.",
    "Nézd meg az okmányokat: törzskönyv, forgalmi, eredetiség.",
    "Vezess egy hosszabb próbautat hidegen indítva is.",
    "Keress rozsdát a küszöbökön, kerékjáratokban, aljvázon.",
  ];
  if (d.fuel === "Dízel") base.push("Dízelnél: DPF-állapot, füstölés, EGR, adagoló.");
  if (d.fuel === "Elektromos" || d.fuel === "Hibrid") base.push("Akkumulátor egészségi állapota (SoH) — kérj mérést.");
  if (d.gearbox === "Automata") base.push("Automata váltó: rángatás, késés, olajcsere-dokumentum.");
  return base;
}

function fitText(d) {
  const map = {
    városi: "Városi használathoz a kis fogyasztás és a jó manőverezhetőség a lényeg; benzines/hibrid gyakran jobb, mint a dízel.",
    hosszútáv: "Sok autópályához a dízel/hibrid gazdaságos lehet, ha a szerviztörténet rendben van.",
    vegyes: "Vegyes használathoz a megbízhatóság és a fenntartási költség a döntő.",
    család: "Családi autónál a biztonság (NCAP), tér és a szervizháttér a legfontosabb.",
    első: "Első autóhoz olcsó fenntartású, elterjedt, jól javítható modell ajánlott.",
  };
  return map[d.usage] || "Nézd meg, hogy a modell fenntartási költsége belefér-e a keretedbe.";
}

/* -------- Megjelenítés -------- */
function showLoading() {
  resultEmpty.hidden = true;
  resultBody.hidden = false;
  resultBody.innerHTML =
    '<div class="spinner"><div class="spinner__d"></div><p>Elemzés készül…</p></div>';
}

function renderResult(a, d, isDemo) {
  resultEmpty.hidden = true;
  resultBody.hidden = false;

  const tone = a.tone || (a.riskScore < 35 ? "good" : a.riskScore < 60 ? "warn" : "bad");
  const gaugeColor = tone === "good" ? "var(--good)" : tone === "warn" ? "var(--warn)" : "var(--bad)";

  const maintenance = (a.maintenance || []).map((c) => `<li>${esc(c)}</li>`).join("");
  const checklist = (a.checklist || []).map((c) => `<li>${esc(c)}</li>`).join("");
  const issues = (a.knownIssues || []).map((i) => {
    const src = i.source ? ` <a class="src" href="${esc(i.source)}" target="_blank" rel="noopener">forrás ↗</a>` : "";
    return `<li class="fc"><div class="fc__top"><b>${esc(i.title)}</b></div>
      <span class="fc__detail">${esc(i.detail || "")}${src}</span></li>`;
  }).join("");

  const urgClass = { "esedékes": "bad", "hamarosan": "warn", "figyeld": "good" };
  const forecast = (a.forecast || []).map((f) => `
    <li class="fc" data-u="${esc(f.urgency || "figyeld")}">
      <div class="fc__top">
        <b>${esc(f.title)}</b>
        <span class="tag ${urgClass[f.urgency] || "good"}">${esc(f.urgency || "")}</span>
      </div>
      <span class="fc__detail">${esc(f.detail || "")}</span>
      ${f.estCost ? `<span class="fc__cost">${esc(f.estCost)}</span>` : ""}
      ${f.source ? `<a class="src" href="${esc(f.source)}" target="_blank" rel="noopener">forrás ↗</a>` : ""}
    </li>`).join("");

  resultBody.innerHTML = `
    <div class="verdict">
      <div class="gauge" id="gauge" style="--p:0; --gc:${gaugeColor}">
        <div class="gauge__in" id="gaugeNum">0</div>
      </div>
      <div>
        <div class="v-label">${esc(a.verdict)}</div>
        <div class="v-sub">Kockázati pont ${a.riskScore}/100 — magasabb = több kockázat</div>
      </div>
    </div>

    ${a.known && a.known.names.length
      ? `<div class="detected">
           <span class="detected__label">Felismert motor / váltó</span>
           <span class="detected__names">${a.known.names.map(esc).join(" · ")}</span>
           ${a.known.notes.length ? `<span class="detected__note">${esc(a.known.notes[0])}</span>` : ""}
         </div>`
      : `<div class="detected detected--miss">
           <span class="detected__label">Nincs felismert motor</span>
           <span class="detected__note">Írd a modell mezőbe a motort is (pl. <b>Volkswagen Golf 1.9 TDI</b>),
             vagy másold be a hirdetés szövegét — így motor-specifikus hibákat is kapsz az általános helyett.</span>
         </div>`}

    <div class="block"><h4>Összegzés</h4><p>${esc(a.summary)}</p></div>

    ${a.mainRisk ? renderMainRisk(a.mainRisk, d) : renderNoRisk(d)}

    ${forecast ? `<div class="block--key">
      <h4 style="display:flex;align-items:center;gap:11px;margin:0 0 6px;font-size:0.71rem;
                 font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:var(--smoke)">
        Mi jön a vásárlás után?
      </h4>
      <p style="font-size:0.86rem;color:var(--smoke);margin:0 0 16px">
        ${d.km.toLocaleString("hu-HU")} km-től a következő 50 000 km-ben
      </p>
      <ul class="fclist">${forecast}</ul>
      <p class="micro">Csak a döntést érdemben befolyásoló tételek — a rutin fogyóeszközöket
        (olajcsere, szűrők, fék, gyertya, folyadékok) szándékosan nem listázzuk.</p>
    </div>` : ""}

    ${a.review ? `<div class="block"><h4>Vélemény</h4><p>${esc(a.review)}</p></div>` : ""}

    <div class="block"><h4>Ár értékelése</h4><p>${esc(a.priceAssessment)}</p></div>

    <div class="block"><h4>Ismert típushibák${isDemo ? " · általános" : " · fórumokból"}</h4>
      <ul class="fclist">${issues}</ul></div>

    ${maintenance ? `<div class="block"><h4>Karbantartási ajánlások</h4>
      <ul class="plainlist">${maintenance}</ul></div>` : ""}

    <div class="block"><h4>Illeszkedés az igényeidhez</h4><p>${esc(a.fitForNeeds)}</p></div>

    <div class="block"><h4>Ellenőrző lista vásárlás előtt</h4>
      <ul class="plainlist">${checklist}</ul></div>

    <div class="block"><h4>Élő hirdetések</h4>
      <div class="links">
        <a class="linkbtn" href="${esc(mobiledeUrl(d))}" target="_blank" rel="noopener">
          <span>mobile.de</span><small>szűrve</small></a>
        <a class="linkbtn" href="${esc(hasznaltautoUrl(d))}" target="_blank" rel="noopener">
          <span>hasznaltauto.hu</span><small>márka / modell</small></a>
      </div>
      <p class="micro">A mobile.de link évjáratra, üzemanyagra, km-re és váltóra is szűr.
        A hasznaltauto.hu a szűrőket kódolt linkbe rejti, ezért ott a modell-listára viszünk.</p>
    </div>

    ${isDemo ? '<div class="note">Ez DEMÓ elemzés — a böngésző számolta. Az éles AI verzió a szabad szöveget értelmezi, és valós fórumokból kutat modell-specifikus típushibákat, karbantartási ajánlásokat és kockázatokat, forrás-linkekkel.</div>' : ""}
  `;

  // A mérőóra felszámol a végértékig
  const g = document.getElementById("gauge");
  const gn = document.getElementById("gaugeNum");
  const target = a.riskScore;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    g.style.setProperty("--p", target); gn.textContent = target;
  } else {
    const t0 = performance.now(), dur = 900;
    const step = (now) => {
      const k = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - k, 3);
      const v = Math.round(target * eased);
      g.style.setProperty("--p", v); gn.textContent = v;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}

/* Ha nem találtunk kiemelkedő kockázatot, azt KI KELL MONDANI — az üres hely
   úgy néz ki, mintha elromlott volna valami, pedig ez jó hír. */
function renderNoRisk(d) {
  const km = d.km.toLocaleString("hu-HU");
  return `
    <section class="mainrisk mainrisk--calm">
      <div class="mainrisk__head">
        <span class="mainrisk__eyebrow">A legnagyobb kockázat · ${km} km-nél</span>
        <h3 class="mainrisk__title">Ennél a futásnál nincs kiemelkedő kockázat</h3>
      </div>
      <dl class="mainrisk__body">
        <div><dt>Mit jelent ez?</dt><dd>Az adatbázisunkban ehhez a hajtáslánchoz nincs olyan
          tipikus meghibásodás, ami ${km} km körül jellemzően bekövetkezne. Ez jó jel — de nem
          garancia: a konkrét darab állapota és előélete ennél többet számít.</dd></div>
        <div><dt>Mit nézz meg akkor is?</dt><dd>Szerviztörténet és valós km, hidegindítás,
          hosszabb próbaút, alulnézeti átvizsgálás (rozsda, folyás), és egy független
          szakértői vizsgálat vásárlás előtt.</dd></div>
      </dl>
    </section>`;
}

/* A fő kockázat részletes bemutatása — ez az elemzés lényege */
function renderMainRisk(mr, d) {
  const f = mr.item, deep = mr.deep;
  const km = d.km.toLocaleString("hu-HU");
  const rows = [];
  if (deep) {
    rows.push(["Miért éppen most?", deep.why]);
    rows.push(["Árulkodó jelek", deep.signs]);
    rows.push(["Mit kérdezz az eladótól?", deep.ask]);
    rows.push(["Ha nem foglalkozol vele", deep.risk]);
  } else {
    rows.push(["Miről van szó?", f.detail]);
  }
  return `
    <section class="mainrisk">
      <div class="mainrisk__head">
        <span class="mainrisk__eyebrow">A legnagyobb kockázat · ${km} km-nél</span>
        <h3 class="mainrisk__title">${esc(f.title)}</h3>
        ${f.engine ? `<span class="mainrisk__engine">${esc(f.engine)}</span>` : ""}
      </div>
      <dl class="mainrisk__body">
        ${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}
      </dl>
      ${f.estCost ? `<div class="mainrisk__cost">
        <span>Ha bekövetkezik</span><b>${esc(f.estCost)}</b></div>` : ""}
    </section>`;
}

function renderError(err) {
  resultBody.hidden = false;
  resultEmpty.hidden = true;
  resultBody.innerHTML = `<div class="note">Hiba történt: ${esc(err.message)}. Próbáld újra.</div>`;
}

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

document.getElementById("patreonBtn").addEventListener("click", function (e) {
  e.preventDefault();
  alert("Itt lesz majd a Patreon támogatói linked. 🙂");
});
