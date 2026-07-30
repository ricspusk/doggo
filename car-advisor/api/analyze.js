// ============================================================
// AutóTanács — élő AI backend (Vercel serverless function)
// ------------------------------------------------------------
// A böngésző ide küldi az autó adatait; ez biztonságosan meghívja a
// Claude AI-t a szerveren tárolt API-kulccsal (a kulcs SOHA nem kerül
// a böngészőbe). Az AI:
//   • webes kereséssel valós fórumokból kutat típushibákat,
//     karbantartási ajánlásokat és kockázatokat,
//   • értelmezi a felhasználó szabad szövegét és véleményt ír,
//   • strukturált JSON-t ad vissza, forrás-linkekkel.
//
// Telepítés: lásd README.md. Kell: ANTHROPIC_API_KEY env változó a Vercelen.
// ============================================================

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // ANTHROPIC_API_KEY env változót automatikusan használja

const JSON_SHAPE = `{
  "verdict": "rövid ítélet, pl. 'Megfontolandó vétel'",
  "riskScore": 0-100 egész (magasabb = több kockázat),
  "forecast": [
    {
      "title": "pl. 'Vezérműszíj csere' vagy 'DPF eltömődés'",
      "kind": "karbantartás vagy meghibásodás",
      "urgency": "esedékes | hamarosan | figyeld",
      "detail": "MIÉRT és MIKOR: konkrét km-értékkel, pl. 'a gyári terv szerint 180 000 km-nél esedékes'",
      "estCost": "tájékoztató költség Ft-ban, tartományban",
      "source": "forrás URL, ha fórumból/dokumentumból jön"
    }
  ],
  "review": "2-4 mondatos vélemény, ami a szabad szöveget is figyelembe veszi",
  "priceAssessment": "az ár értékelése (óvatosan, tartományban; ne találj ki pontos árat)",
  "knownIssues": [ { "title": "…", "detail": "…", "source": "forrás URL, ha van" } ],
  "maintenance": [ "karbantartási ajánlás", "…" ],
  "checklist": [ "vásárlás előtti ellenőrzési pont", "…" ],
  "fitForNeeds": "illik-e a vevő igényeihez",
  "summary": "1-2 mondatos összegzés"
}`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Csak POST." });

  try {
    const d = req.body || {};

    const system =
      "Tapasztalt, tárgyilagos használtautó-tanácsadó vagy.\n\n" +
      "A LEGFONTOSABB FELADATOD a 'forecast' mező: a megadott KILOMÉTERÓRA-ÁLLÁSBÓL kiindulva " +
      "sorold fel, milyen KARBANTARTÁSOK esedékesek és milyen TIPIKUS MEGHIBÁSODÁSOK várhatók " +
      "a vásárlás utáni következő kb. 50 000 km-ben. Legyen minél több konkrét, hasznos elem " +
      "(cél: 6-12 tétel), mindegyiknél KM-ÉRTÉKKEL ('a szíj 180 000 km-nél esedékes'), " +
      "sürgősséggel és tájékoztató költséggel. Ez a felhasználó fő kérdése: 'mire készüljek, " +
      "ha ennyi km-rel megveszem?'\n\n" +
      "NE listázd a rutin fogyóeszközöket: motorolaj- és szűrőcsere, levegő/pollen/üzemanyagszűrő, " +
      "fékbetét és féktárcsa, gyújtógyertya, ablaktörlő, hűtő- és fékfolyadék, akkumulátor. " +
      "Ezek kis összegűek és nem befolyásolják a vételi döntést — kihagyásuk szándékos. " +
      "CSAK olyan tételt írj, ami vagy jelentős kiadás (durván 60 000 Ft felett), vagy " +
      "elhanyagolva komoly kárt okoz (pl. vezérműszíj, váltóolaj). Előnyben: vezérmű (szíj/lánc), " +
      "váltó és kuplung/lendkerék, turbó, DPF/EGR/injektor, katalizátor, hajtásakkumulátor, " +
      "lengéscsillapító és futómű, kormánymű, generátor/önindító, klímakompresszor, " +
      "motor általános állapota, rozsdásodás.\n\n" +
      "HASZNÁLD a web_search eszközt: keress rá a konkrét márkára/modellre/motorra/évjáratra és " +
      "olyan kifejezésekre, mint 'típushibák', 'common problems', 'reliability', " +
      "'maintenance schedule', 'at 200000 km', fórumnevek. Valós tulajdonosi fórumokból és " +
      "szervizelési tervekből gyűjts adatot. A talált állításokhoz adj forrás-URL-t " +
      "(forecast[].source és knownIssues[].source).\n\n" +
      "Értelmezd a felhasználó szabad szövegét, és a 'review' mezőben arra is reagálj " +
      "(ha pl. említ egy hibát vagy egy elvégzett javítást, azt vedd figyelembe a " +
      "kockázatban és az előrejelzésben is).\n\n" +
      "Légy őszinte a bizonytalanságról; ne találj ki pontos árakat vagy statisztikákat — " +
      "a költségeket tartományban add meg. A válasz nyelve magyar. Ez tájékoztatás, nem " +
      "szakértői vizsgálat.\n\n" +
      "KIZÁRÓLAG egyetlen JSON objektumot adj vissza, pontosan ilyen szerkezettel, minden " +
      "magyarázó szöveg nélkül:\n" + JSON_SHAPE;

    const facts = [
      `Márka és modell: ${d.model}`,
      d.bodyType && `Kivitel: ${d.bodyType}`,
      `Évjárat: ${d.year}`,
      `Futott km: ${d.km}`,
      `Ár: ${d.price} Ft`,
      d.powerHp && `Teljesítmény: ${d.powerHp} LE`,
      d.fuel && `Üzemanyag: ${d.fuel}`,
      d.gearbox && `Váltó: ${d.gearbox}`,
      d.drivetrain && `Hajtás: ${d.drivetrain}`,
      d.doors && `Ajtók: ${d.doors}`,
      d.condition && `Állapot: ${d.condition}`,
      d.serviceBook && `Szervizkönyv: ${d.serviceBook}`,
      `Használat: ${d.usage}`,
      `Legfontosabb szempont: ${d.priority}`,
      d.freeText && `Szabad szöveg a felhasználótól: ${d.freeText}`,
    ].filter(Boolean).join("\n");

    let messages = [{ role: "user", content: facts + "\n\nAdd meg az elemzést a kért JSON formátumban." }];

    // A web_search egy szerveroldali eszköz-hurkot indíthat; kezeljük a pause_turn-t.
    let response;
    for (let i = 0; i < 4; i++) {
      response = await client.messages.create({
        model: "claude-opus-5", // olcsóbb alternatíva: "claude-sonnet-5"
        max_tokens: 8000,
        output_config: { effort: "medium" },
        system,
        tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6 }],
        messages,
      });
      if (response.stop_reason !== "pause_turn") break;
      messages.push({ role: "assistant", content: response.content });
    }

    // Az utolsó szöveges blokkból nyerjük ki a JSON-t.
    const texts = response.content.filter((b) => b.type === "text").map((b) => b.text);
    const raw = texts.join("\n").trim();
    const jsonStr = raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    const start = jsonStr.indexOf("{");
    const end = jsonStr.lastIndexOf("}");
    const analysis = JSON.parse(jsonStr.slice(start, end + 1));

    return res.status(200).json(analysis);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Az elemzés nem sikerült." });
  }
}
