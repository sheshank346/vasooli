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

  const prompt = "A B2B invoice is overdue. Details:\n" +
    "Business: " + business_name + "\n" +
    "Amount: \u20B9" + amount + "\n" +
    "Days overdue: " + days_overdue + "\n" +
    "Debtor's response to follow-up: \"" + debtor_response + "\"\n\n" +
    "Classify this response into exactly one category: genuine_promise, evasive, dispute, or already_paid_claim.\n" +
    "Also give a confidence score from 0-100 for how likely this debtor will actually pay soon.\n\n" +
    "Respond ONLY in this exact JSON format, nothing else:\n" +
    "{\"category\": \"one_of_the_four_categories\", \"confidence\": number, \"reasoning\": \"one short sentence explaining why\"}";

  try {
        const requestBody = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    });

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestBody).toString()
        },
        body: requestBody
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      return res.status(500).json({ category: "unknown", confidence: 0, reasoning: "Gemini API error", step: "fetch_not_ok", status: geminiResponse.status, errorText: errorText });
    }

    const data = await geminiResponse.json();

    if (!data.candidates) {
      return res.status(500).json({ category: "unknown", confidence: 0, reasoning: "No candidates", step: "no_candidates", raw: data });
    }

    const rawText = data.candidates[0].content.parts[0].text;
    const cleanText = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanText);

    res.status(200).json(parsed);

  } catch (error) {
    res.status(500).json({ category: "unknown", confidence: 0, reasoning: "Classification failed", step: "catch_block", details: error.message });
  }
}