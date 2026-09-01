export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ category: "unknown", confidence: 0, reasoning: "Bad request body", details: e.message });
    }
  }

  const { business_name, amount, days_overdue, debtor_response } = body;

Classify this response into exactly one category: genuine_promise, evasive, dispute, or already_paid_claim.
Also give a confidence score from 0-100 for how likely this debtor will actually pay soon.

Respond ONLY in this exact JSON format, nothing else:
{"category": "one_of_the_four_categories", "confidence": number, "reasoning": "one short sentence explaining why"}`;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    if (!data.candidates) {
      return res.status(500).json({ category: "unknown", confidence: 0, reasoning: "AI unavailable", raw: data });
    }

    const rawText = data.candidates[0].content.parts[0].text;
    // Clean up in case AI wraps response in markdown code fences
    const cleanText = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanText);

    res.status(200).json(parsed);

  } catch (error) {
    res.status(500).json({ category: "unknown", confidence: 0, reasoning: "Classification failed", details: error.message });
  }
}