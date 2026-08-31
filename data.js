// Sample debtor responses across different real-world categories
const responseTemplates = {
  genuine_promise: [
    "Sorry for the delay, I'll clear this by next Friday.",
    "Yes I remember this, will pay within 3-4 days.",
    "My accountant is processing it, expect payment by Monday.",
    "Apologies, cash flow issue this month, will pay by 15th."
  ],
  evasive: [
    "I'll check and get back to you.",
    "Let me look into this and revert.",
    "Busy right now, will discuss later.",
    "Noted, will update you soon."
  ],
  dispute: [
    "This invoice amount seems wrong, we already paid partial.",
    "We didn't receive the full order, need to discuss before paying.",
    "There's a quality issue with the last shipment, holding payment.",
    "This was supposed to be adjusted against last month's credit."
  ],
  already_paid_claim: [
    "We already paid this on the 5th, please check your records.",
    "This is paid, I have the transaction reference if needed.",
    "Payment was made last week via NEFT, please confirm receipt.",
    "Already settled this, check with your accounts team."
  ]
};

const businesses = ["Sharma Textiles", "Verma Traders", "Patel Industries", "Singh Enterprises", "Gupta & Sons", "Kumar Fabrics"];

// Weighted distribution across categories
const categoryWeights = {
  genuine_promise: 35,
  evasive: 30,
  dispute: 20,
  already_paid_claim: 15
};

function pickWeightedCategory() {
  const total = Object.values(categoryWeights).reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (const cat in categoryWeights) {
    rand -= categoryWeights[cat];
    if (rand <= 0) return cat;
  }
}

function generateInvoiceRecord(index) {
  const category = pickWeightedCategory();
  const templates = responseTemplates[category];
  const response = templates[Math.floor(Math.random() * templates.length)];
  const business = businesses[Math.floor(Math.random() * businesses.length)];
  const amount = Math.floor(Math.random() * 100000) + 5000;
  const daysOverdue = Math.floor(Math.random() * 90) + 30;

  return {
    invoice_id: "inv_" + String(index).padStart(4, "0"),
    business_name: business,
    amount: amount,
    days_overdue: daysOverdue,
    debtor_response: response,
    true_category: category
  };
}

// Generate 50 sample invoices
const invoiceRecords = [];
for (let i = 1; i <= 50; i++) {
  invoiceRecords.push(generateInvoiceRecord(i));
}