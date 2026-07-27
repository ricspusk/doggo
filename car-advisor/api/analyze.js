// ============================================================
// AutóTanács — élő AI backend (Vercel serverless function)
// ------------------------------------------------------------
// Ez a fájl a Vercelen fut (NEM a GitHub Pages-en). A böngésző ide
// küldi az autó adatait, ez pedig biztonságosan meghívja a Claude AI-t
// a szerveren tárolt API-kulccsal. Az API-kulcs SOHA nem kerül a
// böngészőbe.
//
// Telepítés dióhéjban (részletek a README.md-ben):
//   1) Hozz létre egy Anthropic API-kulcsot: console.anthropic.com
//   2) Tedd fel ezt a projektet a Vercelre (vercel.com), és add meg
//      környezeti változóként: ANTHROPIC_API_KEY = a kulcsod
//   3) A frontend app.js-ben állítsd be az API_URL-t a Vercel címedre.
// ============================================================

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // az ANTHROPIC_API_KEY env változót automatikusan használja

// Az AI-tól kért, kötött JSON szerkezet (így megbízhatóan feldolgozható)
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    verdict: { type: "string", description: "Rövid összefoglaló ítélet, pl. 'Megfontolandó vétel'" },
    riskScore: { type: "integer", description: "Kockázati pont 0-100, magasabb = több kockázat" },
    priceAssessment: { type: "string", description: "Az ár értékelése a modell, évjárat, km alapján" },
    knownIssues: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
        },
        required: ["title", "detail"],
      },
    },
    checklist: { type: "array", items: { type: "string" } },
    fitForNeeds: { type: "string" },
    summary: { type: "string" },
  },
  required: ["verdict", "riskScore", "priceAssessment", "knownIssues", "checklist", "fitForNeeds", "summary"],
};

export default async function handler(req, res) {
  // CORS — hogy a GitHub Pages-en futó frontend meghívhassa
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Csak POST." });

  try {
    const d = req.body || {};

    const system =
      "Tapasztalt, tárgyilagos használtautó-tanácsadó vagy. A felhasználó által " +
      "megadott adatokból és a modellről szóló általános tudásodból adj elemzést. " +
      "Legyél őszinte a bizonytalanságról: ha valamit nem lehet az adatokból megítélni, " +
      "mondd ki. Ne találj ki konkrét árakat vagy statisztikákat; ár esetén tartományban, " +
      "óvatosan fogalmazz. A válasz nyelve magyar. Ez tájékoztatás, nem szakértői vizsgálat.";

    const userMsg =
      `Autó: ${d.model}, évjárat ${d.year}, ${d.km} km, ár ${d.price} Ft, ` +
      `${d.fuel}, ${d.gearbox} váltó.\n` +
      `Vevő: használat = ${d.usage}, legfontosabb szempont = ${d.priority}.\n` +
      (d.notes ? `Megjegyzés / hirdetés: ${d.notes}\n` : "") +
      `Adj: rövid ítéletet, 0-100 kockázati pontot, ár-értékelést, modell-specifikus ` +
      `ismert típushibákat, vásárlás előtti ellenőrző listát, és hogy illik-e az igényekhez.`;

    const response = await client.messages.create({
      model: "claude-opus-5", // olcsóbb alternatíva: "claude-sonnet-5"
      max_tokens: 4000,
      output_config: {
        effort: "low", // gyors és költséghatékony ehhez a feladathoz
        format: { type: "json_schema", schema: SCHEMA },
      },
      system,
      messages: [{ role: "user", content: userMsg }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const analysis = JSON.parse(textBlock.text);
    return res.status(200).json(analysis);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Az elemzés nem sikerült." });
  }
}
