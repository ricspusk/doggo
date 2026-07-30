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
function hasznaltautoUrl(d) {
  const parts = String(d.model || "").trim().split(/\s+/);
  const brand = slug(parts[0]);
  const model = parts[1] ? slug(parts[1]) : "";
  if (!brand) return "https://www.hasznaltauto.hu/";
  return model
    ? `https://www.hasznaltauto.hu/szemelyauto/${brand}/${model}`
    : `https://www.hasznaltauto.hu/szemelyauto/${brand}`;
}
function mobiledeUrl(d) {
  const q = encodeURIComponent(String(d.model || "").trim());
  let u = `https://suchen.mobile.de/fahrzeuge/search.html?isSearchRequest=true&ref=quickSearch&s=Car&vc=Car&ms=;;;${q}`;
  if (d.km) u += `&maxMileage=${Math.round(d.km * 1.3)}`;
  return u;
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

    ${a.review ? `<div class="section"><h3>Vélemény</h3><p>${esc(a.review)}</p></div>` : ""}

    <div class="section"><h3>Ár értékelése</h3><p>${esc(a.priceAssessment)}</p></div>

    <div class="section"><h3>Ismert típushibák${isDemo ? " (általános)" : " (fórumokból)"}</h3><ul class="issues">${issues}</ul></div>

    ${maintenance ? `<div class="section"><h3>Karbantartási ajánlások</h3><ul class="checklist">${maintenance}</ul></div>` : ""}

    <div class="section"><h3>Illeszkedés az igényeidhez</h3><p>${esc(a.fitForNeeds)}</p></div>

    <div class="section"><h3>Ellenőrző lista vásárlás előtt</h3><ul class="checklist">${checklist}</ul></div>

    <div class="section"><h3>Nézd meg az élő hirdetéseket</h3>
      <div class="links">
        <a class="linkbtn" href="${esc(hasznaltautoUrl(d))}" target="_blank" rel="noopener">hasznaltauto.hu →</a>
        <a class="linkbtn" href="${esc(mobiledeUrl(d))}" target="_blank" rel="noopener">mobile.de →</a>
      </div>
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
