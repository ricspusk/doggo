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

const form = document.getElementById("carForm");
const submitBtn = document.getElementById("submitBtn");
const resultEmpty = document.getElementById("resultEmpty");
const resultBody = document.getElementById("resultBody");
const modePill = document.getElementById("modePill");

modePill.textContent = API_URL ? "Élő AI" : "Demó mód";

form.addEventListener("submit", async function (e) {
  e.preventDefault();
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
    p.set("minFirstRegistrationDate", `${d.year - 1}-01-01`);
    p.set("maxFirstRegistrationDate", `${d.year + 1}-12-31`);
  }
  if (d.km) p.set("maxMileage", String(Math.round(d.km * 1.3)));
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
  if (d.serviceBook === "Nincs") risk += 8;
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

  return {
    verdict, tone, riskScore: risk,
    forecast: buildForecast(d),
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

  // --- Motor / hajtáslánc: a legdrágább kockázatok ---
  push(km >= 70000, { title: "Vezérműszíj + vízpumpa csere", kind: "karbantartás",
    urgency: km >= 120000 ? "esedékes" : "hamarosan",
    detail: "Típusfüggő 60–120 e km-enként. Elmulasztva a szíj elszakad és TÖNKREMEGY a motor — kérdezz rá, cserélték-e és mikor, kérj számlát.",
    estCost: "kb. 80–250 e Ft" });
  push(km >= 120000, { title: "Vezérműlánc nyúlása (láncos motoroknál)", kind: "meghibásodás",
    urgency: km >= 180000 ? "esedékes" : "figyeld",
    detail: "Hidegindításkor csörgő/zörgő hang az árulkodó jel. Sok modellnél 150–250 e km körül jelentkezik, és a javítás motorbontással jár.",
    estCost: "kb. 200–700 e Ft" });
  push(d.gearbox === "Automata", { title: "Automata / DSG váltóolaj csere", kind: "karbantartás",
    urgency: km >= 60000 ? "esedékes" : "figyeld",
    detail: "Sokan kihagyják — kihagyva a váltó tönkremehet, ami a legdrágább javítások egyike. Kérj rá dokumentumot.",
    estCost: "kb. 60–150 e Ft" });
  push(d.gearbox === "Automata" && km >= 150000, { title: "Automata váltó / DSG kuplung felújítás", kind: "meghibásodás",
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

  return F;
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
    '<div class="spinner"><div class="spinner__dot"></div><p>Elemzés készül…</p></div>';
}

function renderResult(a, d, isDemo) {
  resultEmpty.hidden = true;
  resultBody.hidden = false;

  const tone = a.tone || (a.riskScore < 35 ? "good" : a.riskScore < 60 ? "warn" : "bad");
  const gaugeColor = tone === "good" ? "var(--good)" : tone === "warn" ? "var(--warn)" : "var(--bad)";

  const issues = (a.knownIssues || []).map((i) => {
    const src = i.source ? ` <a class="src" href="${esc(i.source)}" target="_blank" rel="noopener">forrás ↗</a>` : "";
    return `<li><b>${esc(i.title)}</b><span>${esc(i.detail || "")}${src}</span></li>`;
  }).join("");
  const maintenance = (a.maintenance || []).map((c) => `<li>${esc(c)}</li>`).join("");
  const checklist = (a.checklist || []).map((c) => `<li>${esc(c)}</li>`).join("");

  const urgClass = { "esedékes": "bad", "hamarosan": "warn", "figyeld": "good" };
  const forecast = (a.forecast || []).map((f) => `
    <li class="fc">
      <div class="fc__head">
        <b>${esc(f.title)}</b>
        <span class="badge ${urgClass[f.urgency] || "good"}">${esc(f.urgency || "")}</span>
      </div>
      <span class="fc__detail">${esc(f.detail || "")}</span>
      ${f.estCost ? `<span class="fc__cost">Tájékoztató költség: ${esc(f.estCost)}</span>` : ""}
      ${f.source ? ` <a class="src" href="${esc(f.source)}" target="_blank" rel="noopener">forrás ↗</a>` : ""}
    </li>`).join("");

  resultBody.innerHTML = `
    <div class="verdict">
      <div class="gauge" style="--p:${a.riskScore}; --gauge-color:${gaugeColor}">
        <div class="gauge__inner">${a.riskScore}</div>
      </div>
      <div class="verdict__text">
        <div class="v-label">${esc(a.verdict)}</div>
        <div class="v-sub">Kockázati pont: ${a.riskScore}/100 (magasabb = több kockázat)</div>
      </div>
    </div>

    <div class="section"><h3>Összegzés</h3><p>${esc(a.summary)}</p></div>

    ${forecast ? `<div class="section highlight">
      <h3>⏱️ Mi jön a vásárlás után? — ${d.km.toLocaleString("hu-HU")} km-től a következő 50 000 km-ben</h3>
      <ul class="issues forecast">${forecast}</ul>
      <p class="hint">Csak a döntést érdemben befolyásoló tételek. A rutin fogyóeszközöket (olajcsere, szűrők, fékbetét, gyertya, folyadékok) szándékosan nem listázzuk.</p>
    </div>` : ""}

    ${a.review ? `<div class="section"><h3>Vélemény</h3><p>${esc(a.review)}</p></div>` : ""}

    <div class="section"><h3>Ár értékelése</h3><p>${esc(a.priceAssessment)}</p></div>

    <div class="section"><h3>Ismert típushibák${isDemo ? " (általános)" : " (fórumokból)"}</h3><ul class="issues">${issues}</ul></div>

    ${maintenance ? `<div class="section"><h3>Karbantartási ajánlások</h3><ul class="checklist">${maintenance}</ul></div>` : ""}

    <div class="section"><h3>Illeszkedés az igényeidhez</h3><p>${esc(a.fitForNeeds)}</p></div>

    <div class="section"><h3>Ellenőrző lista vásárlás előtt</h3><ul class="checklist">${checklist}</ul></div>

    <div class="section"><h3>Nézd meg az élő hirdetéseket</h3>
      <div class="links">
        <a class="linkbtn" href="${esc(mobiledeUrl(d))}" target="_blank" rel="noopener">mobile.de → <small>szűrve</small></a>
        <a class="linkbtn" href="${esc(hasznaltautoUrl(d))}" target="_blank" rel="noopener">hasznaltauto.hu → <small>márka/modell</small></a>
      </div>
      <p class="hint">A mobile.de link évjáratra, üzemanyagra, km-re és váltóra is szűr. A hasznaltauto.hu a szűrőket kódolt linkbe rejti, ezért ott a modell-listára viszünk — az évjáratot/üzemanyagot egy kattintással beállíthatod az oldalon.</p>
    </div>

    ${isDemo ? '<div class="note">⚠️ Ez DEMÓ elemzés — a böngésző számolta. Az éles AI verzió a szabad szöveget értelmezi, valós fórumokból kutat modell-specifikus típushibákat, karbantartási ajánlásokat és kockázatokat (forrás-linkekkel). Lásd a README-t a bekapcsoláshoz.</div>' : ""}
  `;
  resultBody.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
