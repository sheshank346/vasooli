export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { debtor_message, business_name, amount, days_overdue } = req.body;

  const prompt = "You are a payment collections assistant named Raj, calling on behalf of Sharma Suppliers, speaking to a representative of " + business_name + " about an overdue invoice of Rs " + amount + " that is " + days_overdue + " days overdue. Do not use placeholder text like [Your Name] or [Supplier] - use the actual names given here.\n\n" +
    "The debtor just said: \"" + debtor_message + "\"\n\n" +
    "Respond naturally and briefly (1-2 sentences), as a real collections call would. Be professional, not aggressive. Respond with ONLY the spoken reply text, nothing else.";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150
      })
    });

    const data = await response.json();

    if (!data.choices) {
      return res.status(500).json({ reply: "Sorry, I couldn't respond right now.", raw: data });
    }

    const replyText = data.choices[0].message.content.trim();
    res.status(200).json({ reply: replyText });

  } catch (error) {
    res.status(500).json({ reply: "Sorry, I couldn't respond right now.", details: error.message });
  }
}