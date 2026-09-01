export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: "Bad request body" });
    }
  }

  const { debtor_message, business_name, amount, days_overdue } = body;

  const prompt = "You are a polite but firm payment collections assistant calling on behalf of a supplier, speaking to " + business_name + " about an overdue invoice of Rs " + amount + " that is " + days_overdue + " days overdue.\n\n" +
    "The debtor just said: \"" + debtor_message + "\"\n\n" +
    "Respond naturally and briefly (1-2 sentences), as a real collections call would. Be professional, not aggressive. If they promised to pay, confirm the date. If they're evasive, gently push for a specific commitment. If they dispute the invoice, ask for details calmly. Respond in simple English, mixing in a little Hindi/Hinglish phrasing naturally if appropriate (like 'theek hai', 'samjh gaya', etc), since this is an Indian business context.\n\n" +
    "Respond with ONLY the spoken reply text, nothing else, no labels or formatting.";

  const requestBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }]
  });

  try {
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
      return res.status(500).json({ reply: "Sorry, I couldn't respond right now.", error: errorText });
    }

    const data = await geminiResponse.json();

    if (!data.candidates) {
      return res.status(500).json({ reply: "Sorry, I couldn't respond right now.", raw: data });
    }

    const replyText = data.candidates[0].content.parts[0].text.trim();
    res.status(200).json({ reply: replyText });

  } catch (error) {
    res.status(500).json({ reply: "Sorry, I couldn't respond right now.", details: error.message });
  }
}