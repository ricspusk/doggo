/* ============================================================
   AutóTanács — frontend logic
   ------------------------------------------------------------
   Two modes:
   1) DEMÓ mód (alapértelmezett): a böngésző számol egy tájékoztató
      kockázati elemzést a megadott adatokból. Nem kell hozzá szerver.
   2) ÉLES AI mód: ha beállítod lent az API_URL-t (a Vercelre telepített
      /api/analyze függvény címére), akkor az oldal a valódi Claude AI-t
      hívja meg, ami modell-specifikus típushibákat és részletesebb
      elemzést ad. Lásd a README.md-t.
   ============================================================ */

// 👇 Ha van élő backended, ide írd a címét, pl. "https://autotanacs.vercel.app/api/analyze"
//    Üresen hagyva DEMÓ módban fut.
const API_URL = "";

const form = document.getElementById("carForm");
const submitBtn = document.getElementById("submitBtn");
const resultEmpty = document.getElementById("resultEmpty");
const resultBody = document.getElementById("resultBody");
const modePill = document.getElementById("modePill");

modePill.textContent = API_URL ? "Élő AI" : "Demó mód";

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  data.year = Number(data.year);
  data.km = Number(data.km);
  data.price = Number(data.price);

  showLoading();
  submitBtn.disabled = true;

  try {
    const analysis = API_URL ? await callRealAI(data) : demoAnalyze(data);
    renderResult(analysis, data, !API_URL);
  } catch (err) {
    renderError(err);
  } finally {
    submitBtn.disabled = false;
  }
});

/* -------- ÉLES AI hívás (csak ha API_URL be van állítva) -------- */
async function callRealAI(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("A szerver hibát adott (" + res.status + ").");
  return await res.json();
}

/* -------- DEMÓ elemzés: egyszerű, őszinte heurisztika -------- */
function demoAnalyze(d) {
  const now = 2026;
  const age = Math.max(now - d.year, 0);
  const kmPerYear = age > 0 ? Math.round(d.km / age) : d.km;

  // Kockázati pont (0 = nyugodt, 100 = sok kockázat)
  let risk = 15;
  if (d.km > 200000) risk += 25;
  else if (d.km > 150000) risk += 15;
  else if (d.km > 100000) risk += 8;
  if (age > 15) risk += 20;
  else if (age > 10) risk += 12;
  else if (age > 6) risk += 5;
  if (kmPerYear > 25000) risk += 12;
  else if (kmPerYear < 6000 && age > 3) risk += 8; // gyanúsan kevés = garázs vagy tekert óra?
  if (d.fuel === "dízel" && d.usage === "városi") risk += 12; // DPF/részecskeszűrő gond
  if (d.gearbox === "automata" && age > 10) risk += 6;
  risk = Math.max(5, Math.min(95, risk));

  let verdict, tone;
  if (risk < 35) { verdict = "Alacsony kockázat"; tone = "good"; }
  else if (risk < 60) { verdict = "Megfontolandó"; tone = "warn"; }
  else { verdict = "Fokozott kockázat"; tone = "bad"; }

  // Általános (típusfüggetlen) figyelmeztetések a demóhoz
  const issues = [];
  if (d.fuel === "dízel" && d.usage === "városi")
    issues.push({ title: "Dízel + városi használat", detail: "A részecskeszűrő (DPF) és az EGR-szelep városban hajlamos eltömődni. Kérdezz rá a szerviztörténetre." });
  if (d.km > 150000)
    issues.push({ title: "Magas futásteljesítmény", detail: "Vezérlés, kuplung, futómű kopóalkatrészei ilyenkor gyakran cserére érnek." });
  if (age > 10)
    issues.push({ title: "Kor miatti kopás", detail: "Gumitömítések, szíjak, akkumulátor és rozsdásodás a jellemző pontok idősebb autóknál." });
  if (d.gearbox === "automata")
    issues.push({ title: "Automata váltó", detail: "Kérdezz rá az olajcserére; a váltójavítás drága lehet." });
  if (issues.length === 0)
    issues.push({ title: "Nincs kiugró kockázat az adatokból", detail: "Ettől még a konkrét darab állapota dönt — nézesd meg alaposan." });

  const checklist = buildChecklist(d);

  return {
    verdict,
    tone,
    riskScore: risk,
    priceAssessment:
      "Az ár valós piaci értékeléséhez élő AI és friss hirdetési adat kell. " +
      "Tipp: keress rá ugyanerre a modellre, évjáratra és hasonló km-re több hirdetésben, és hasonlítsd össze.",
    knownIssues: issues,
    checklist,
    fitForNeeds: fitText(d),
    summary:
      `${d.model} (${d.year}, ${d.km.toLocaleString("hu-HU")} km): kb. ${kmPerYear.toLocaleString("hu-HU")} km/év. ` +
      `A megadott adatok alapján a kockázati szint: ${verdict.toLowerCase()}.`,
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
  if (d.fuel === "dízel") base.push("Dízelnél: DPF-állapot, füstölés, EGR, adagoló.");
  if (d.fuel === "elektromos" || d.fuel === "hibrid") base.push("Akkumulátor egészségi állapota (SoH) — kérj mérést.");
  if (d.gearbox === "automata") base.push("Automata váltó: rángatás, késés, olajcsere-dokumentum.");
  return base;
}

function fitText(d) {
  const map = {
    városi: "Városi használathoz a kis fogyasztás és a jó manőverezhetőség a lényeg; benzines vagy hibrid gyakran jobb, mint a dízel.",
    hosszútáv: "Sok autópályához a dízel vagy hibrid gazdaságos lehet, ha a szerviztörténet rendben van.",
    vegyes: "Vegyes használathoz a megbízhatóság és a fenntartási költség a döntő.",
    család: "Családi autónál a biztonság (NCAP), tér és a szervizháttér a legfontosabb.",
    első: "Első autóhoz az olcsó fenntartás és a jól javítható, elterjedt modell ajánlott.",
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

  const issues = (a.knownIssues || [])
    .map((i) => `<li><b>${esc(i.title)}</b><span>${esc(i.detail || "")}</span></li>`)
    .join("");
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

    <div class="section"><h3>Ár értékelése</h3><p>${esc(a.priceAssessment)}</p></div>

    <div class="section"><h3>Mire figyelj a modellnél</h3><ul class="issues">${issues}</ul></div>

    <div class="section"><h3>Illeszkedés az igényeidhez</h3><p>${esc(a.fitForNeeds)}</p></div>

    <div class="section"><h3>Ellenőrző lista vásárlás előtt</h3><ul class="checklist">${checklist}</ul></div>

    ${isDemo ? '<div class="note">⚠️ Ez DEMÓ elemzés — a böngésző számolta a megadott adatokból. Az éles AI verzió konkrét, modell-specifikus típushibákat és valós ár-értékelést ad. Lásd a README-t a bekapcsoláshoz.</div>' : ""}
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

/* Patreon gomb — cseréld a saját Patreon linkedre, ha lesz */
document.getElementById("patreonBtn").addEventListener("click", function (e) {
  e.preventDefault();
  alert("Itt lesz majd a Patreon támogatói linked. 🙂");
});
