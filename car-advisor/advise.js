/* ============================================================
   AutóTanács — TÍPUSAJÁNLÓ logika
   ------------------------------------------------------------
   Bemenet: rövid űrlap + szabad szöveg.
   Kimenet: 3 konkrét típus-javaslat, mindegyiknél MELYIK MOTORRAL
   és MELYIK ÉVJÁRATTAL érdemes megvenni, a megadott kereten belül.

   A keret KEMÉNY korlát: olyan konfigurációt soha nem ajánlunk,
   aminek az alsó ára sem fér bele.
   ============================================================ */

/* ---- Amit a szabad szövegből kiolvasunk ----
   Minden szabály: minta → mit jelent. A `read` az a mondat, amit
   visszamutatunk a felhasználónak, hogy lássa, mit értettünk meg. */
const NEED_RULES = [
  { m: /gyerek|gyerek[üu]l[ée]s|\bbaba|bab[aá]kocsi|iskol[áa]ba|\bovi|csal[áa]d/i,
    read: "családi használat, gyerekekkel", tags: ["család", "gyerek", "nagy csomagtartó"], usage: "család" },
  /* FIGYELEM: itt kötelező a szóhatár. A „heten” szóhatár nélkül beleakadt a
     „HETENTE megyünk a Balatonra” mondatba, és 7 ülést kényszerített rá. */
  { m: /\bh[áa]rom gyerek|\b3 gyerek|\bn[ée]gy gyerek|\b4 gyerek|nagycsal[áa]d|\bheten\b|\bh[ée]t f[őo]\b|\b7 f[őo]\b|\b7 [üu]l[ée]s/i,
    read: "hét ülésre van szükség", tags: ["7 ülés"], seats: 7 },
  /* A magyar toldalékolás miatt a szótő magánhangzója változik: kutya → kutyÁnk.
     Ezért a végét szándékosan nyitva hagyjuk (kuty[aá]). */
  { m: /kuty[aá]|\beb\b|\b[áa]llat|kennel|lovagl|ker[ée]kp[áa]r|bicikli|s[íi]l[ée]c|\bdeszka|sz[öo]rf/i,
    read: "nagy, jól pakolható csomagtér kell", tags: ["nagy csomagtartó", "kombi", "kutya", "pakolható"] },
  { m: /csomagtart|csomagt[ée]r|sok cucc|pakol|elf[ée]rjen|k[öo]lt[öo]z|nagy t[ée]r/i,
    read: "nagy csomagtartó a fontos", tags: ["nagy csomagtartó", "kombi", "pakolható"], priority: "tér" },
  { m: /von(tat|tat[áa]s)|ut[áa]nfut[óo]|lak[óo]kocsi|utanfuto|von[óo]horog|lovas|trailer/i,
    read: "vontatni is szeretnél", tags: ["vontatás"], minTow: true },
  { m: /aut[óo]p[áa]ly|hossz[úu] [úu]t|sokat vez|ing[áa]z|napi \d{2,} ?km|vid[ée]kre j|megyek dolgozni.*\d{2,}/i,
    read: "sok hosszú távú vezetés", tags: ["hosszú táv", "kényelmes"], usage: "hosszútáv" },
  { m: /belv[áa]ros|v[áa]rosban|parkol|sz[űu]k utc|dug[óo]|pesten|budapesten|r[öo]vid ?ut/i,
    read: "főleg városi közlekedés", tags: ["város", "könnyű parkolás"], usage: "városi" },
  { m: /els[őo] aut[óo]|most szereztem|friss jogos|tanul[óo]|kezd[őo] vagyok/i,
    read: "első autó, kezdő vezetőnek", tags: ["első autó", "olcsó fenntartás"], usage: "első" },
  { m: /olcs[óo]n? (tart|[üu]zem|fenntart)|kev[ée]s p[ée]nz|takar[ée]kos|spórol|keveset költ|fogyaszt[áa]s sz[áa]m[íi]t/i,
    read: "alacsony fenntartási költség a legfontosabb", tags: ["olcsó fenntartás", "kis fogyasztás"], priority: "ár" },
  { m: /megb[íi]zhat|ne romoljon|ne kelljen szerel|ne [áa]lljon le|biztos legyen|ne legyen vele baj/i,
    read: "a megbízhatóság a legfontosabb", tags: ["megbízható"], priority: "megbízhatóság" },
  { m: /automat|nem tudok kuplung|nem szeretek v[áa]lt|bal l[áa]b/i,
    read: "automata váltó kell", tags: ["automata"], gearbox: "Automata" },
  { m: /(?:ne|nem)\s+(?:legyen|akarok|szeretn[ée]k|k[ée]rek|kell)\b[^.!?]{0,20}d[íi]zel|d[íi]zelt?\s+(?:ne|nem)\b|benzines legyen|semmik[ée]pp.{0,15}d[íi]zel/i,
    read: "nem szeretnél dízelt", tags: [], noFuel: "Dízel" },
  { m: /elektromos|villanyaut|z[öo]ld rendsz[áa]m|\bev\b|t[öo]lt[őo]oszlop|otthon.{0,12}t[öo]lt/i,
    read: "elektromos autót szeretnél", tags: ["elektromos", "zöld rendszám"], preferFuel: "Elektromos" },
  { m: /hibrid/i, read: "hibrid hajtás érdekel", tags: ["hibrid"], preferFuel: "Hibrid" },
  /* FIGYELEM: a rövid szavaknál kell a szóhatár, különben a „hó” beleakad az
     „otthon”-ba, a „tél” a „tele”-be. Ez élesben rossz javaslatot adott. */
  { m: /\bh[óo]\b|havas|\bt[ée]len\b|\bhegy|s[íi]el|d[űu]l[őo]|f[öo]ldút|\berd[őo]\b|tany[áa]|rossz [úu]t|makadam|szikla/i,
    read: "rossz úton / télen is használnád", tags: ["hasmagasság", "összkerék", "hó", "SUV"] },
  { m: /magas [üu]l[ée]|suv|terepj|be[üu]l[ée]s|h[áa]tf[áa]j|k[öo]nnyen be/i,
    read: "magas üléspozíció, könnyű beszállás", tags: ["SUV", "hasmagasság"] },
  { m: /gyors|er[őo]s|sportos|[éa]lm[ée]ny|j[óo]l vezet/i,
    read: "vezetési élmény is számít", tags: ["jó vezetés", "gyors"] },
  { m: /\bsz[ée]p\b|diz[áa]jn|\bdesign\b|ne legyen ciki|mutat[óo]s|pr[ée]mium|ig[ée]nyes/i,
    read: "a megjelenés és az anyagminőség is fontos", tags: ["szép", "igényes belső", "prémium"] },
  { m: /csendes|halk|zaj/i, read: "csendes utastér", tags: ["csendes", "kényelmes"] },
  { m: /fiatal aut|kev[ée]s km|keveset futott|garanci/i,
    read: "fiatal, keveset futott autót szeretnél", tags: ["fiatal autó", "kis futás", "garancia"] },
  { m: /\bg[áa]z\b|\blpg\b|autóg[áa]z/i, read: "gázüzem érdekel", tags: ["gáz"], preferFuel: "LPG / gáz" },
];

const SEAT_MAP = { "1-2": 2, "3-4": 4, "5": 5, "7": 7 };

/* A szabad szöveg feldolgozása: mit értettünk meg belőle */
function readFreeText(text) {
  const t = String(text || "");
  const out = { tags: {}, read: [], seats: 0, gearbox: null, noFuel: null,
                preferFuel: null, usage: null, priority: null };
  if (!t.trim()) return out;
  NEED_RULES.forEach((r) => {
    if (!r.m.test(t)) return;
    out.read.push(r.read);
    (r.tags || []).forEach((tag) => { out.tags[tag] = (out.tags[tag] || 0) + 1; });
    if (r.seats) out.seats = Math.max(out.seats, r.seats);
    if (r.gearbox) out.gearbox = r.gearbox;
    if (r.noFuel) out.noFuel = r.noFuel;
    if (r.preferFuel && !out.preferFuel) out.preferFuel = r.preferFuel;
    if (r.usage && !out.usage) out.usage = r.usage;
    if (r.priority && !out.priority) out.priority = r.priority;
  });
  return out;
}

/* Az űrlap + a szabad szöveg együtt adja ki az igényt */
function buildNeed(d) {
  const ft = readFreeText(d.freeText);
  return {
    budget: Number(d.budget) || 0,
    usage: d.usage || ft.usage || "vegyes",
    seats: Math.max(SEAT_MAP[d.people] || 4, ft.seats),
    annualKm: Number(d.annualKm) || 15000,
    gearbox: d.gearbox && d.gearbox !== "" ? d.gearbox : ft.gearbox,
    priority: d.priority || ft.priority || "megbízhatóság",
    tags: ft.tags,
    noFuel: ft.noFuel,
    preferFuel: ft.preferFuel,
    read: ft.read,
    freeText: d.freeText || "",
  };
}

/* Egy konfiguráció (pick) beleférését és illeszkedését pontozzuk */
function scorePick(pick, need) {
  if (pick.price[0] > need.budget) return null;      // KEMÉNY korlát: nem fér bele
  if (need.gearbox && pick.gearbox !== need.gearbox) return null;
  if (need.noFuel && pick.fuel === need.noFuel) return null;

  let s = 0;
  // Ha a szövegben KIMONDTAD, milyen hajtást szeretnél, az erős jelzés:
  // ilyenkor a többi hajtás csak akkor jöhet szóba, ha minden másban jobb.
  if (need.preferFuel) {
    if (pick.fuel === need.preferFuel) s += 55;
    else if (need.preferFuel === "Elektromos" && pick.fuel === "Hibrid") s += 8; // közeli kompromisszum
    else s -= 30;
  }
  // A keret kihasználása: a jó vétel a keret 55–100%-a között van
  const mid = (pick.price[0] + pick.price[1]) / 2;
  const use = mid / need.budget;
  if (use > 1) s += 6;              // a keret az alsó sávra elég — még reális
  else if (use > 0.7) s += 16;      // pont beleillik
  else if (use > 0.45) s += 10;
  else s -= 7;                      // jóval a keret alatt: ha ennyit tudsz költeni,
                                    // egy fiatalabb, kevesebbet futott darab jobb vétel

  // Üzemanyag és éves futás összhangja — ez a leggyakoribb drága hiba
  if (pick.fuel === "Dízel") {
    if (need.annualKm >= 20000) s += 10;
    else if (need.annualKm >= 15000) s += 2;
    else s -= 14;                                   // keveset járó dízel = DPF-gond
    if (need.usage === "városi") s -= 16;
  }
  if ((pick.fuel === "Hibrid") && (need.usage === "városi" || need.usage === "vegyes")) s += 12;
  if (pick.fuel === "Elektromos") {
    if (need.annualKm >= 30000) s -= 6;             // sok autópálya + töltés = kényelmetlen
    if (need.usage === "városi") s += 10;
  }
  if (pick.fuel === "Benzin" && need.annualKm < 15000) s += 6;
  return { pick, s };
}

function scoreCar(car, need) {
  // 1) Van-e olyan konfiguráció, ami belefér a keretbe?
  const scored = car.picks.map((p) => scorePick(p, need)).filter(Boolean);
  if (!scored.length) return null;
  scored.sort((a, b) => b.s - a.s);
  const best = scored[0];

  // 2) Kemény igények
  if (need.seats >= 7 && car.seats < 7) return null;
  if (need.seats >= 5 && car.seats < 5) return null;

  let s = best.s;
  const reasons = [];

  // 3) Használati mód
  const fit = (car.fit && car.fit[need.usage]) || 3;
  s += fit * 9;
  if (fit >= 5) reasons.push(usageReason(need.usage, car));

  // 4) Amit a legfontosabbnak jelöltél
  const sc = car.s || {};
  if (need.priority === "megbízhatóság") { s += (sc.rel || 3) * 9; if ((sc.rel || 0) >= 5) reasons.push("A megbízhatóság a legfontosabb szempontod — ez a típus ebben a mezőny élén van."); }
  if (need.priority === "ár") { s += (sc.run || 3) * 9; if ((sc.run || 0) >= 5) reasons.push("Kifejezetten olcsón tartható: alacsony fogyasztás, olcsó és jól elérhető alkatrész."); }
  if (need.priority === "kényelem") { s += (sc.comfort || 3) * 9; if ((sc.comfort || 0) >= 5) reasons.push("Az utazókényelme a kategória élmezőnyében van."); }
  if (need.priority === "tér") { s += (sc.space || 3) * 9; if ((sc.space || 0) >= 5) reasons.push("A tere és a csomagtartója a kategória legjobbjai közé tartozik."); }

  // Alap minőség: a megbízhatóság és a fenntartás mindig számít valamennyit
  s += (sc.rel || 3) * 4 + (sc.run || 3) * 3;

  // 5) A szabad szövegből kiolvasott igények
  const carTags = car.tags || [];
  Object.entries(need.tags).forEach(([tag, w]) => {
    if (carTags.includes(tag)) { s += 11 * w; reasons.push(tagReason(tag)); }
  });

  // 6) Ülésszám
  if (need.seats >= 7 && car.seats >= 7) { s += 22; reasons.push("Hét üléses — ezt kifejezetten kérted."); }
  if (need.seats <= 2 && (sc.space || 3) <= 2) s += 6;

  return { car, pick: best.pick, score: s, reasons: dedupe(reasons).slice(0, 4) };
}

function usageReason(usage, car) {
  const m = {
    városi: "Városi közlekedésre való: könnyen kezelhető méret és alacsony városi fogyasztás.",
    hosszútáv: "Hosszú útra épült: csendes, kényelmes, és autópályán is takarékos.",
    vegyes: "Vegyes használatra ez a típus az egyik legkiegyensúlyozottabb választás.",
    család: "Családi használatra ideális: tér, biztonság és pakolhatóság együtt.",
    első: "Első autónak kifejezetten ajánlott: olcsó, egyszerű és megbocsátó.",
  };
  return m[usage] || `A ${car.klass} kategória egyik legkiegyensúlyozottabb darabja.`;
}

function tagReason(tag) {
  const m = {
    "7 ülés": "Hét üléses változatban is kapható.",
    "nagy csomagtartó": "Nagy, jól használható csomagtartó — pont amit a leírásod alapján keresel.",
    "kombi": "Kombi karosszériával a pakolhatósága SUV-szintű, fogyasztásban viszont jobb.",
    "vontatás": "Vontatásra alkalmas: van hozzá gyári vonóhorog és elég nyomatéka.",
    "összkerék": "Elérhető összkerékhajtással — télen és rossz úton érezhető előny.",
    "hasmagasság": "Magas üléspozíció és jó hasmagasság.",
    "hó": "Télen, havas úton is jól használható.",
    "olcsó fenntartás": "A fenntartása kifejezetten olcsó — ezt jelölted fontosnak.",
    "megbízható": "A megbízhatósága a mezőny élén van.",
    "hibrid": "Hibrid hajtással: nincs kuplung, nincs DPF, alig kopik a fék.",
    "elektromos": "Tisztán elektromos — otthoni töltéssel a kilométerköltség töredékére esik.",
    "automata": "Automata váltóval kapható, méghozzá a megbízható fajtából.",
    "első autó": "Kezdő vezetőnek is jó választás.",
    "kis fogyasztás": "Kifejezetten alacsony fogyasztás.",
    "könnyű parkolás": "Kis méret, jó kilátás — városban ez sokat számít.",
    "jó vezetés": "A vezetési élménye a kategória fölé nyúlik.",
    "kényelmes": "Kényelmes, csendes utastér.",
    "csendes": "Csendes utastér hosszú úton is.",
    "igényes belső": "Az anyagminősége a kategória fölött szól.",
    "prémium": "Prémium környezet, elérhető áron.",
    "szép": "Karakteres, mutatós formaterv.",
    "kutya": "Kutyaszállításra praktikus, egyenes padlójú csomagtér.",
    "pakolható": "Variálható, jól pakolható belső tér.",
    "gyerek": "Gyerekkel praktikus: jó beszállás és sok tárolóhely.",
    "fiatal autó": "Ebben az árban fiatal, keveset futott darabot lehet találni.",
    "kis futás": "Alacsony futásteljesítményű példányok is elérhetők ebben az árban.",
    "garancia": "Sok darabon még él gyári garancia vagy annak maradványa.",
    "zöld rendszám": "Zöld rendszámos — parkolási és adókedvezményekkel.",
    "gáz": "Gyári gázüzemmel is kapható, alacsony kilométerköltséggel.",
    "papírozott szerviz": "A hosszú gyári garancia miatt gyakori a hiánytalan szerviztörténet.",
    "sok hely hátul": "Kiemelkedően nagy hátsó lábtér.",
  };
  return m[tag] || null;
}

function dedupe(arr) {
  const seen = new Set(), out = [];
  arr.filter(Boolean).forEach((x) => { if (!seen.has(x)) { seen.add(x); out.push(x); } });
  return out;
}

/* A fő függvény: a legjobb 3 javaslat */
function recommend(d) {
  const need = buildNeed(d);
  const all = KB_CARS.map((c) => scoreCar(c, need)).filter(Boolean);
  all.sort((a, b) => b.score - a.score);

  // Ne ajánljunk három ugyanolyan autót: márkánként legfeljebb egyet
  const picked = [], usedBrand = new Set();
  for (const r of all) {
    if (usedBrand.has(r.car.brand) && picked.length < 3) continue;
    picked.push(r); usedBrand.add(r.car.brand);
    if (picked.length === 3) break;
  }
  // Ha így kevesebb mint 3 jött össze, feltöltjük a maradékból
  for (const r of all) {
    if (picked.length >= 3) break;
    if (!picked.includes(r)) picked.push(r);
  }
  // Ha semmi nem fért bele, kiszámoljuk, honnan indulna a dolog — ez
  // hasznosabb a felhasználónak, mint egy üres „nincs találat”.
  let floor = null;
  if (!picked.length) {
    const relaxed = { ...need, budget: Infinity };
    KB_CARS.forEach((c) => {
      if (need.seats >= 7 && c.seats < 7) return;
      c.picks.forEach((p) => {
        const r = scorePick(p, relaxed);
        if (!r) return;
        if (floor === null || p.price[0] < floor.price) floor = { price: p.price[0], car: c, pick: p };
      });
    });
  }
  return { need, results: picked, total: all.length, floor };
}

/* ---- Kereső-linkek az ajánlott konfigurációra ---- */
function adviceHasznaltautoUrl(r) {
  const b = slug(r.car.brand), m = slug(r.car.model);
  return `https://www.hasznaltauto.hu/szemelyauto/${b}${m ? "/" + m : ""}`;
}
function adviceMobiledeUrl(r) {
  const yrs = pickYears(r.pick.label) || r.car.years;
  return mobiledeUrl({
    model: `${r.car.brand} ${r.car.model}`,
    fuel: r.pick.fuel,
    gearbox: r.pick.gearbox,
    year: yrs[0],
    km: null,
    maxPrice: r.pick.price[1],
    yearTo: yrs[1],
  });
}
/* Az ajánlás címkéjéből ("… 2017–2019, manuális") kiolvassuk az évjárat-sávot */
function pickYears(label) {
  const m = String(label || "").match(/(20\d\d)\s*[–-]\s*(20\d\d)/);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

const HUF = (n) => Math.round(n).toLocaleString("hu-HU") + " Ft";
const MFT = (n) => (n / 1000000).toFixed(1).replace(".", ",") + " M Ft";

/* ============================================================
   ŰRLAP + MEGJELENÍTÉS
   ============================================================ */
(function initAdvisor() {
  const form = document.getElementById("adviceForm");
  if (!form) return;
  const empty = document.getElementById("adviceEmpty");
  const body = document.getElementById("adviceBody");
  const btn = document.getElementById("adviceBtn");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    if (!Number(d.budget)) {
      form.elements.budget.focus();
      form.elements.budget.reportValidity();
      return;
    }
    btn.disabled = true;
    empty.hidden = true;
    body.hidden = false;
    body.innerHTML = '<div class="spinner"><div class="spinner__d"></div><p>Végignézzük a típusokat…</p></div>';
    // Egy képkockányi szünet, hogy a töltésjelző tényleg meg tudjon jelenni
    setTimeout(() => {
      try { renderAdvice(recommend(d), d); }
      catch (err) { body.innerHTML = `<div class="note">Hiba: ${esc(err.message)}</div>`; }
      finally { btn.disabled = false; }
    }, 260);
  });

  function renderAdvice(out, d) {
    const { need, results, total, floor } = out;
    if (!results.length) {
      body.innerHTML = floor
        ? `<div class="understood">
             <span class="understood__label">Ebbe a keretbe ez sajnos nem fér bele</span>
             <p style="margin:0 0 10px;font-size:0.92rem;line-height:1.6">
               A megadott <b>${MFT(need.budget)}</b> keret az igényeidhez kevés. Az ezeknek megfelelő
               legolcsóbb reális kezdet a <b>${esc(floor.car.name)}</b>, amiből
               <b>${MFT(floor.price)}</b> körül lehet találni tisztességes darabot.
             </p>
             <p style="margin:0;font-size:0.88rem;color:var(--smoke);line-height:1.6">
               Két út van: vagy emeled a keretet eddig, vagy lazítasz egy feltételen —
               a hét ülés és a kötelező automata váltó emeli meg a legjobban az árat.
               Ennél olcsóbban is lehet autót venni, de akkor a kockázat nő meg, nem az ár csökken.
             </p>
           </div>`
        : `<div class="note">
             <b>Ezekkel a feltételekkel nem tudunk típust ajánlani.</b><br />
             Próbáld lazítani az egyik feltételt (váltó, ülésszám, hajtás), vagy emeld a keretet.
           </div>`;
      return;
    }

    const readBack = need.read.length
      ? `<div class="understood">
           <span class="understood__label">Ezt olvastam ki abból, amit írtál</span>
           <ul>${need.read.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
         </div>`
      : `<div class="understood understood--miss">
           <span class="understood__label">Nem írtál szabad szöveget</span>
           <span class="understood__note">Ha leírod, mire kell az autó és mi aggaszt, sokkal pontosabb
             javaslatot tudok adni — pl. „két kisgyerek, hetente Balaton, télen hegyi út”.</span>
         </div>`;

    const cards = results.map((r, i) => renderCard(r, i, need)).join("");

    body.innerHTML = `
      ${readBack}
      <div class="brief">
        <span>Keret <b>${MFT(need.budget)}</b></span>
        <span>Használat <b>${esc(need.usage)}</b></span>
        <span>Évi <b>${need.annualKm.toLocaleString("hu-HU")} km</b></span>
        <span>Ülés <b>${need.seats >= 7 ? "7" : need.seats}</b></span>
        ${need.gearbox ? `<span>Váltó <b>${esc(need.gearbox)}</b></span>` : ""}
      </div>
      <p class="micro">${KB_CARS.length} típusból ${total} felelt meg a feltételeidnek és fért bele
        a keretbe — ezek közül a legjobb ${results.length}. Az árak 2026-os magyar piaci becslések:
        a konkrét darab állapota ennél többet számít.</p>
      ${cards}
      <div class="note">Ez tájékoztató javaslat, nem szakértői vizsgálat. Ha kiválasztottál egy darabot,
        használd a második szolgáltatást: ott a konkrét autó km-állására mondjuk meg, mi jön utána.</div>`;
  }

  function renderCard(r, i, need) {
    const c = r.car, p = r.pick;
    const rank = ["Ezt ajánlom elsőként", "Második lehetőség", "Harmadik lehetőség"][i] || "További lehetőség";
    const reasons = r.reasons.length ? r.reasons : c.why.slice(0, 2);
    const bars = [
      ["Megbízhatóság", c.s.rel], ["Olcsó fenntartás", c.s.run],
      ["Kényelem", c.s.comfort], ["Tér", c.s.space],
    ];
    // URI-kódolva tesszük az attribútumba, hogy az idézőjelek biztosan ne törjék el
    const analyzeData = encodeURIComponent(JSON.stringify({
      model: `${c.brand} ${c.model} ${engineOf(p.label)}`.trim(),
      year: (pickYears(p.label) || c.years)[1],
      fuel: p.fuel, gearbox: p.gearbox, price: p.price[0],
    }));

    return `
    <article class="rec ${i === 0 ? "rec--top" : ""}">
      <header class="rec__head">
        <span class="rec__rank">${esc(rank)}</span>
        <h3 class="rec__name">${esc(c.name)}</h3>
        <span class="rec__klass">${esc(metaLine(c))}</span>
      </header>

      <div class="rec__pick">
        <span class="rec__pick-label">Ezzel a motorral és évjárattal vedd</span>
        <b class="rec__pick-name">${esc(p.label)}</b>
        <span class="rec__pick-price">${MFT(p.price[0])} – ${MFT(p.price[1])}</span>
        <span class="rec__pick-km">jellemző futás: ${esc(p.km)}</span>
        <p class="rec__pick-why">${esc(p.why)}</p>
      </div>

      <div class="rec__block">
        <h4>Miért ez jó választás neked?</h4>
        <ul class="reasons">${reasons.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      </div>

      <div class="rec__bars">
        ${bars.map(([k, v]) => `
          <div class="bar"><span class="bar__k">${esc(k)}</span>
            <span class="bar__t"><i style="width:${(v || 3) * 20}%"></i></span></div>`).join("")}
      </div>

      <details class="rec__more">
        <summary>Mire figyelj ennél a típusnál, és mit kerülj el</summary>
        <div class="rec__more-in">
          <h5>Amit tudni érdemes</h5>
          <ul class="reasons">${c.why.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
          <h5>Erre figyelj vásárláskor</h5>
          <ul class="reasons reasons--warn">${c.watch.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
          <h5>Ezt a változatát KERÜLD</h5>
          <ul class="reasons reasons--bad">${c.avoid.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        </div>
      </details>

      <div class="rec__links">
        <a class="linkbtn" href="${esc(adviceHasznaltautoUrl(r))}" target="_blank" rel="noopener">
          <span>hasznaltauto.hu</span><small>hirdetések</small></a>
        <a class="linkbtn" href="${esc(adviceMobiledeUrl(r))}" target="_blank" rel="noopener">
          <span>mobile.de</span><small>évjáratra és árra szűrve</small></a>
        <button type="button" class="linkbtn linkbtn--act" data-analyze="${analyzeData}">
          <span>Elemezd ezt</span><small>km-alapú előrejelzés</small></button>
      </div>
    </article>`;
  }

  /* Kategória · ülésszám · kivitel — a kivitelt elhagyjuk, ha ugyanaz, mint a
     kategória (különben „egyterű · 7 ülés · Egyterű” lenne belőle). */
  function metaLine(c) {
    const body = c.body.filter((b) => b.toLowerCase() !== c.klass.toLowerCase());
    return [c.klass, `${c.seats} ülés`, body.join(" / ")].filter(Boolean).join(" · ");
  }

  /* A címke elejéről kiszedjük a motort ("1.6 TDI CR (105 LE), 2011–2013, manuális") */
  function engineOf(label) {
    return String(label || "").split(",")[0].replace(/\(.*?\)/g, "").trim();
  }

  /* „Elemezd ezt” → átemeljük az adatokat a második szolgáltatás űrlapjába */
  body.addEventListener("click", (e) => {
    const b = e.target.closest("[data-analyze]");
    if (!b) return;
    let d;
    try { d = JSON.parse(decodeURIComponent(b.getAttribute("data-analyze"))); } catch { return; }
    const f = document.getElementById("carForm");
    if (!f) return;
    f.elements.model.value = d.model;
    f.elements.model.dispatchEvent(new Event("input", { bubbles: true }));
    f.elements.year.value = d.year;
    f.elements.price.value = d.price;
    if (!f.elements.km.value) f.elements.km.value = 150000;
    // A modell-szabályok letilthatták az opciót; csak akkor állítjuk be, ha engedélyezett
    setSelectIfAllowed(f.elements.fuel, d.fuel);
    setSelectIfAllowed(f.elements.gearbox, d.gearbox);
    document.getElementById("elemzes").scrollIntoView({ behavior: "smooth", block: "start" });
    f.elements.km.focus();
  });

  function setSelectIfAllowed(sel, value) {
    if (!sel) return;
    const opt = Array.from(sel.options).find((o) => o.value === value);
    if (opt && !opt.disabled) sel.value = value;
  }
})();
