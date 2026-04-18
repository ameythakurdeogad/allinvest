import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, email, date, timeSlot, plans, profile } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
  }

  const errors: string[] = [];

  // ── 1. Send email notification via Resend ──────────────────────────────────
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ADVISOR_EMAIL = process.env.ADVISOR_EMAIL || "advisor@yourcompany.com";

  if (RESEND_API_KEY) {
    try {
      const profileSummary = profile
        ? `Age: ${profile.age} | Gender: ${profile.gender} | Life Stage: ${profile.lifeStage} | Income: ${profile.income} | Dependents: ${profile.dependents} | Risk: ${profile.riskAppetite} | Goals: ${(profile.goals || []).join(", ")}`
        : "Profile not captured";

      // Email to advisor
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "FinPlan <noreply@yourdomain.com>",
          to: [ADVISOR_EMAIL],
          subject: `📞 New Call Booking — ${name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #faf8f3;">
              <div style="background: #0f2444; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 22px;">New Consultation Booking</h1>
                <p style="margin: 8px 0 0; opacity: 0.7;">Someone wants to talk to you!</p>
              </div>
              <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; color: #64748b; width: 140px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${name}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b;">Phone</td><td style="padding: 8px 0; font-weight: 600; font-size: 18px;">${phone}</td></tr>
                  ${email ? `<tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0;">${email}</td></tr>` : ""}
                  <tr><td style="padding: 8px 0; color: #64748b;">Preferred Date</td><td style="padding: 8px 0;">${date || "Flexible"}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b;">Time Slot</td><td style="padding: 8px 0;">${timeSlot || "Flexible"}</td></tr>
                  <tr><td style="padding: 8px 0; color: #64748b;">Plans Interested In</td><td style="padding: 8px 0;">${plans?.join(", ") || "Not specified"}</td></tr>
                </table>
                <div style="margin-top: 16px; padding: 16px; background: #f0ece1; border-radius: 6px;">
                  <p style="margin: 0 0 8px; font-weight: 600; color: #0f2444;">User Profile</p>
                  <p style="margin: 0; color: #4a5568; font-size: 14px;">${profileSummary}</p>
                </div>
              </div>
            </div>
          `,
        }),
      });

      // Confirmation email to user (if they provided email)
      if (email) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "FinPlan <noreply@yourdomain.com>",
            to: [email],
            subject: "Your free consultation is booked ✅",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                <div style="background: #0f2444; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; font-size: 22px;">You're all set, ${name}!</h1>
                  <p style="margin: 8px 0 0; opacity: 0.7;">Your free consultation is confirmed</p>
                </div>
                <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
                  <p>Our advisor will call you at <strong>${phone}</strong> during your preferred slot: <strong>${timeSlot || "flexible"}</strong> on <strong>${date || "a date we'll confirm shortly"}</strong>.</p>
                  <p>This call is <strong>completely free and non-binding</strong>. Our advisor will walk you through the plans most relevant to your profile.</p>
                  <p style="color: #64748b;">Plans you expressed interest in: ${plans?.join(", ") || "General advisory"}</p>
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
                  <p style="color: #64748b; font-size: 14px;">If you need to reschedule, just reply to this email.</p>
                </div>
              </div>
            `,
          }),
        });
      }
    } catch (e) {
      errors.push("Email notification failed — please check Resend config");
      console.error("Resend error:", e);
    }
  } else {
    errors.push("RESEND_API_KEY not set — email skipped");
    console.warn("⚠️  RESEND_API_KEY not configured. Booking received but no email sent.");
  }

  // ── 2. Log to Google Sheets ────────────────────────────────────────────────
  const SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (SHEETS_WEBHOOK_URL) {
    try {
      await fetch(SHEETS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          name,
          phone,
          email: email || "",
          date: date || "",
          timeSlot: timeSlot || "",
          plans: plans?.join(", ") || "",
          age: profile?.age || "",
          gender: profile?.gender || "",
          lifeStage: profile?.lifeStage || "",
          income: profile?.income || "",
          dependents: profile?.dependents || "",
          riskAppetite: profile?.riskAppetite || "",
          goals: profile?.goals?.join(", ") || "",
          status: "New",
        }),
      });
    } catch (e) {
      errors.push("Google Sheets logging failed");
      console.error("Sheets webhook error:", e);
    }
  } else {
    errors.push("GOOGLE_SHEETS_WEBHOOK_URL not set — sheet logging skipped");
    console.warn("⚠️  GOOGLE_SHEETS_WEBHOOK_URL not configured. Booking received but not logged to Sheets.");
  }

  return NextResponse.json({
    success: true,
    message: "Booking received",
    warnings: errors.length > 0 ? errors : undefined,
  });
}
