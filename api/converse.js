export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { debtor_message, business_name, amount, days_overdue } = req.body;

  const prompt = "You are a polite but firm payment collections assistant calling on behalf of a supplier, speaking to " + business_name + " about an overdue invoice of Rs " + amount + " that is " + days_overdue + " days overdue.\n\n" +
    "The debtor just said: \"" + debtor_message + "\"\n\n" +
    "Respond naturally and briefly (1-2 sentences), as a real collections call would. Be professional, not aggressive. Respond with ONLY the spoken reply text, nothing else.";

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
      return res.status(500).json({ reply: "Sorry, I couldn't respond right now.", raw: data });
    }

    const replyText = data.candidates[0].content.parts[0].text.trim();
    res.status(200).json({ reply: replyText });

  } catch (error) {
    res.status(500).json({ reply: "Sorry, I couldn't respond right now.", details: error.message });
  }
}