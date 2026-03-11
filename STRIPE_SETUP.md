# 💳 Stripe Payment Setup Guide — Streamia

## What you're setting up
- Companies pay $49/mo (Pro) or $149/mo (Business)
- 7-day free trial on all paid plans
- Automatic billing via Stripe
- Webhooks to auto-upgrade company accounts

---

## STEP 1 — Create Stripe Account (5 min)

1. Go to **stripe.com** → Sign up free
2. Complete your business details (use your real name/business)
3. Once inside, you're in **Test Mode** by default (safe to experiment)

---

## STEP 2 — Create your Products in Stripe (10 min)

In Stripe Dashboard → **Products** → **Add Product**

### Product 1: Streamia Pro
- Name: `Streamia Pro`
- Add price: `$49.00` / month → copy the **Price ID** (looks like `price_1ABC...`)
- Add price: `$39.00` / month / billed yearly → copy this **Price ID** too

### Product 2: Streamia Business
- Name: `Streamia Business`
- Add price: `$149.00` / month → copy the **Price ID**
- Add price: `$119.00` / month / billed yearly → copy this **Price ID** too

---

## STEP 3 — Add Price IDs to your code (5 min)

Open `src/pages/PricingPage.jsx` and replace these lines:

```js
stripePriceMonthly: 'price_pro_monthly',   // → paste your real Pro monthly price ID
stripePriceYearly:  'price_pro_yearly',    // → paste your real Pro yearly price ID
```

```js
stripePriceMonthly: 'price_business_monthly',   // → paste real Business monthly ID
stripePriceYearly:  'price_business_yearly',    // → paste real Business yearly ID
```

---

## STEP 4 — Get your Stripe Secret Key (2 min)

In Stripe → **Developers** → **API Keys**
- Copy the **Secret key** (starts with `sk_test_...`)
- Keep this PRIVATE — never put it in your frontend code

---

## STEP 5 — Deploy Supabase Edge Functions (10 min)

These are mini backend functions that handle payments securely.

### Install Supabase CLI (one time)
```bash
brew install supabase/tap/supabase
```

### Login and link your project
```bash
supabase login
supabase link --project-ref zdulyzlrrpbloklppzfe
```

### Set your secret keys
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Deploy the functions
```bash
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
```

---

## STEP 6 — Set up Stripe Webhook (5 min)

In Stripe → **Developers** → **Webhooks** → **Add endpoint**

- URL: `https://zdulyzlrrpbloklppzfe.supabase.co/functions/v1/stripe-webhook`
- Events to listen for:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`

After adding, click **Reveal signing secret** → copy it
→ Run: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`

---

## STEP 7 — Run the new SQL migration (2 min)

In Supabase SQL Editor → New Query → paste contents of:
`supabase/migrations/002_stripe_subscriptions.sql`
→ Click Run ✅

---

## STEP 8 — Go live with Stripe (when ready)

When you're ready to take real payments:
1. In Stripe → toggle from **Test Mode** to **Live Mode**
2. Create new products + prices in Live Mode
3. Update price IDs in your code
4. Update `STRIPE_SECRET_KEY` to the live key (`sk_live_...`)

---

## 💰 Revenue Projections

| Companies | Plan | Monthly Revenue |
|---|---|---|
| 10 | Pro ($49) | $490/mo |
| 5 | Business ($149) | $745/mo |
| 50 | Pro ($49) | $2,450/mo |
| 20 | Business ($149) | $2,980/mo |

At 50 Pro + 10 Business companies = **$3,940/month** 🚀

---

## Testing Payments

Use Stripe test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC
- Any ZIP code
