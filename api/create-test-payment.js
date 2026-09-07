export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const auth = Buffer.from(keyId + ":" + keySecret).toString("base64");

  try {
    const response = await fetch("https://api.razorpay.com/v1/payment_links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + auth
      },
      body: JSON.stringify({
        amount: 70000 * 100,
        currency: "INR",
        description: "Vasooli test invoice - Singh Enterprises",
        customer: {
          name: "Singh Enterprises",
          email: "test@example.com",
          contact: "+919876543210"
        },
        notify: { sms: false, email: false }
      })
    });

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}