import https from "https";

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
    "Respond naturally and briefly (1-2 sentences), as a real collections call would. Be professional, not aggressive. Respond with ONLY the spoken reply text, nothing else.";

  const requestBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }]
  });

  const options = {
    hostname: "generativelanguage.googleapis.com",
        path: "/v1beta/models/gemini-3.6-flash:generateContent?key=" + encodeURIComponent(process.env.GEMINI_API_KEY),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody)
    }
  };

  const geminiPromise = new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      let data = "";
      response.on("data", (chunk) => { data += chunk; });
      response.on("end", () => { resolve(data); });
    });
    request.on("error", (error) => { reject(error); });
    request.write(requestBody);
    request.end();
  });

   try {
    const rawData = await geminiPromise;

    let parsedData;
    try {
      parsedData = JSON.parse(rawData);
    } catch (parseErr) {
      return res.status(500).json({ reply: "Sorry, I couldn't respond right now.", rawResponseText: rawData.substring(0, 500) });
    }

    if (!parsedData.candidates) {
      return res.status(500).json({ reply: "Sorry, I couldn't respond right now.", raw: parsedData });
    }

    const replyText = parsedData.candidates[0].content.parts[0].text.trim();
    res.status(200).json({ reply: replyText });

  } catch (error) {
    res.status(500).json({ reply: "Sorry, I couldn't respond right now.", details: error.message });
  }