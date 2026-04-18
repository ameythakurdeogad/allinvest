# FinPlan — Personalised Financial Advisory Platform

A Ditto-style financial advisory website that matches users to the right insurance and wealth plans, then lets them book a free advisor call. Every booking notifies you by email and logs the lead to Google Sheets automatically.

---

## What's inside

```
finplan/
├── app/
│   ├── page.tsx              ← Main app (landing → assessment → results)
│   ├── layout.tsx
│   ├── globals.css
│   └── api/book/route.ts     ← Booking API: sends email + logs to Sheets
├── components/
│   ├── LandingPage.tsx       ← Hero, how it works, FAQs
│   ├── Assessment.tsx        ← 9-question profile flow
│   ├── Results.tsx           ← Personalised plan cards + goal filters
│   └── BookingModal.tsx      ← Book a free call form + confirmation
├── lib/
│   ├── questions.ts          ← All 9 assessment questions + options
│   └── recommendations.ts   ← Scoring engine + all 7 Tata AIA plans
├── .env.example              ← Environment variable template
└── README.md
```

---

## Step 1 — Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The app works fully without env vars set — bookings just log a warning in the terminal instead of emailing or writing to Sheets.

---

## Step 2 — Set up Resend (email notifications)

Free for up to 3,000 emails/month.

1. Create a free account at https://resend.com
2. Click API Keys → Create API Key → copy it
3. Open .env.local and fill in:

```
RESEND_API_KEY=re_your_key_here
ADVISOR_EMAIL=you@yourdomain.com
```

What happens on each booking:
- YOU get an email with name, phone, preferred slot, plan interest, and full user profile
- The USER gets a confirmation email (if they provided their email)

---

## Step 3 — Set up Google Sheets (lead log)

### 3a. Create the sheet

1. Create a new Google Sheet at https://sheets.google.com
2. Name it: FinPlan Leads
3. Add these headers in Row 1 (one per column):

   Timestamp | Name | Phone | Email | Date | TimeSlot | Plans | Age | Gender | LifeStage | Income | Dependents | RiskAppetite | Goals | Status

### 3b. Add the webhook script

1. In your sheet: Extensions → Apps Script
2. Delete everything and paste this:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || "",
      data.phone || "",
      data.email || "",
      data.date || "",
      data.timeSlot || "",
      data.plans || "",
      data.age || "",
      data.gender || "",
      data.lifeStage || "",
      data.income || "",
      data.dependents || "",
      data.riskAppetite || "",
      data.goals || "",
      "New"
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Click Save, then Deploy → New deployment
4. Type: Web app | Execute as: Me | Who has access: Anyone
5. Click Deploy → Authorize → copy the Web app URL
6. Paste in .env.local:

```
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_ID/exec
```

---

## Step 4 — Deploy to Vercel (free)

### 4a. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
# Create a repo on github.com then:
git remote add origin https://github.com/YOUR_USERNAME/finplan.git
git push -u origin main
```

### 4b. Deploy on Vercel

1. Go to https://vercel.com → sign in with GitHub
2. Click Add New Project → import your finplan repo
3. Before deploying, click Environment Variables and add:

   RESEND_API_KEY         = re_your_key_here
   ADVISOR_EMAIL          = you@yourdomain.com
   GOOGLE_SHEETS_WEBHOOK_URL = https://script.google.com/macros/s/YOUR_ID/exec

4. Click Deploy — live in ~60 seconds

---

## Step 5 — Customising

### Change brand name and colours
- Brand name: search-replace "FinPlan" across all files
- Colours: edit CSS variables in app/globals.css under :root
  --navy, --gold, --cream are the three main colours

### Add or edit a plan
Open lib/recommendations.ts → add to the PLANS array:

```typescript
{
  id: "your-plan-id",
  name: "Full Plan Name",
  shortName: "Short Name",
  type: "Plan Type",
  tagline: "One-line description",
  description: "2-3 sentence plain language explanation",
  keyBenefits: ["Benefit 1", "Benefit 2"],
  bestFor: "Tag shown on card",
  icon: "🛡️",
  color: "#1a3a6b",
}
```

Then add scoring logic for it in the getRecommendations function.

### Add or edit questions
Open lib/questions.ts → edit the QUESTIONS array.
Each question has: id, step, question, type (single/multi), field, options.

---

## How leads flow end-to-end

User completes assessment
  → Personalised results shown
    → Clicks "Book a Free Call"
      → Fills name + phone (takes 60 seconds)
        → POST /api/book
            ├── Email sent to ADVISOR_EMAIL
            ├── Confirmation email to user (if they gave email)
            └── New row added to Google Sheet
              → You see it in inbox + sheet within seconds
                → You call them at the agreed time

---

## Production checklist

- [ ] RESEND_API_KEY set in Vercel
- [ ] ADVISOR_EMAIL set to your real email
- [ ] Google Sheet created with correct headers
- [ ] Apps Script deployed as Web App (Anyone access)
- [ ] GOOGLE_SHEETS_WEBHOOK_URL set in Vercel
- [ ] Custom domain added (optional)
- [ ] Full end-to-end test done

---

## Tech stack (all free tier)

Next.js 14 (App Router) | Tailwind CSS | Resend | Google Sheets | Vercel
