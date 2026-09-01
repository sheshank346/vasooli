
## Key Engineering Decisions

- **Fallback classification for demo reliability**: Given free-tier API quota limits, a subset of records use live AI classification while the remainder use consistent, category-matched fallback scores — ensuring the dashboard always displays cleanly regardless of quota state.
- **Browser-native voice APIs**: Chose free, built-in Speech Recognition and Speech Synthesis over paid cloud services, keeping the voice feature accessible with zero additional cost or setup.
- **Separate voice demo page**: Isolated the experimental voice feature (`voice-test.html`) from the main dashboard, so core classification functionality remains stable and unaffected by voice-feature iteration.

## Build Challenges & Solutions

- **Gemini API 411 (Length Required) errors**: Node's `fetch` in the Vercel serverless environment had inconsistent `Content-Length` handling. Resolved by switching to Gemini's recommended `x-goog-api-key` header authentication method instead of the URL query parameter approach.
- **API quota limits**: Free tier allows 20 requests/day and 5/minute. Managed by testing with deliberate pacing and using cached/fallback data for the main classification dashboard.
- **Cross-browser voice support**: Speech Recognition API has limited support outside Chrome/Edge. Addressed with explicit browser compatibility messaging rather than silent failure.

## Business Value for Razorpay

- **Complements Razorpay Capital**: Businesses with strong receivables but poor cash flow due to slow-paying customers are exactly the merchants Razorpay Capital's working capital loans are designed to help — Vasooli recovers money owed, addressing the root cause Capital's loans work around.
- **Extends Razorpay's B2B payment collection tools**: Once a debtor commits to pay via Vasooli, the actual collection can flow through Razorpay Payment Links, keeping the full recovery loop within Razorpay's ecosystem.
- **Differentiation through AI-driven prioritization**: Helps merchants focus collections effort efficiently rather than treating all overdue invoices the same way.

## Limitations

This is a hackathon proof-of-concept using synthetic data. Classification confidence scores are modeling estimates based on category patterns, not measured from real collections outcomes. The voice feature is a working prototype demonstrating the conversational mechanism, not a production-ready multi-turn dialogue system.