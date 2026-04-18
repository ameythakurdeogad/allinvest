"use client";
import { useState } from "react";
import { UserProfile } from "@/lib/recommendations";

interface Props {
  preselectedPlan?: string;
  profile: UserProfile;
  onClose: () => void;
}

const TIME_SLOTS = ["Morning (9am – 12pm)", "Afternoon (12pm – 4pm)", "Evening (4pm – 7pm)"];

function getNext7Days() {
  const days = [];
  const today = new Date();
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      value: d.toISOString().split("T")[0],
      label: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
    });
  }
  return days;
}

export default function BookingModal({ preselectedPlan, profile, onClose }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const days = getNext7Days();

  async function handleSubmit() {
    if (!name.trim() || !phone.trim()) {
      setErrorMsg("Name and phone number are required.");
      return;
    }
    if (!/^[0-9]{10}$/.test(phone.replace(/\s/g, ""))) {
      setErrorMsg("Please enter a valid 10-digit phone number.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          date,
          timeSlot,
          plans: preselectedPlan ? [preselectedPlan] : [],
          profile,
        }),
      });

      if (!res.ok) throw new Error("Server error");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again or call us directly.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-navy/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div
          className="sticky top-0 p-6 rounded-t-2xl flex items-start justify-between"
          style={{ background: "linear-gradient(135deg, var(--navy), var(--navy-light))" }}
        >
          <div>
            <h2 className="font-display text-xl font-bold text-white">Book Your Free Call</h2>
            <p className="text-white/70 text-sm mt-1">
              {preselectedPlan ? `About: ${preselectedPlan}` : "Our advisor will call you at your chosen time"}
            </p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl leading-none ml-4">×</button>
        </div>

        {status === "success" ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="font-display text-2xl font-bold text-navy mb-2">You&apos;re booked!</h3>
            <p className="text-slate text-sm mb-2">
              Our advisor will call you at <strong>{phone}</strong>
              {timeSlot && <> during <strong>{timeSlot}</strong></>}
              {date && <> on <strong>{days.find(d => d.value === date)?.label || date}</strong></>}.
            </p>
            <p className="text-slate text-sm mb-6">
              This call is completely free and non-binding.
              {email && " A confirmation has been sent to your email."}
            </p>
            <div className="bg-cream rounded-xl p-4 text-sm text-slate text-left mb-6">
              <p className="font-semibold text-navy mb-2">What to expect on the call</p>
              <ul className="space-y-1">
                <li>✓ A walk-through of your recommended plans</li>
                <li>✓ Answers to all your questions in plain language</li>
                <li>✓ No pressure to buy anything</li>
              </ul>
            </div>
            <button onClick={onClose} className="btn-primary px-8 py-3 rounded-xl font-semibold text-sm">
              Done
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Name */}
            <div>
              <label className="text-sm font-semibold text-navy block mb-1.5">
                Your name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Rahul Sharma"
                className="w-full border-2 border-cream-dark rounded-xl px-4 py-3 text-navy focus:border-navy outline-none transition-colors"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-semibold text-navy block mb-1.5">
                Phone number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <span className="border-2 border-cream-dark rounded-xl px-3 py-3 text-slate text-sm bg-cream flex items-center">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="98765 43210"
                  className="flex-1 border-2 border-cream-dark rounded-xl px-4 py-3 text-navy focus:border-navy outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email (optional) */}
            <div>
              <label className="text-sm font-semibold text-navy block mb-1.5">
                Email <span className="text-slate font-normal">(optional — for confirmation)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="rahul@example.com"
                className="w-full border-2 border-cream-dark rounded-xl px-4 py-3 text-navy focus:border-navy outline-none transition-colors"
              />
            </div>

            {/* Date */}
            <div>
              <label className="text-sm font-semibold text-navy block mb-1.5">Preferred date</label>
              <div className="grid grid-cols-4 gap-2">
                {days.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setDate(d.value)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-medium border-2 transition-all ${
                      date === d.value
                        ? "border-navy bg-navy text-white"
                        : "border-cream-dark bg-white text-navy hover:border-navy/30"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time slot */}
            <div>
              <label className="text-sm font-semibold text-navy block mb-1.5">Preferred time</label>
              <div className="space-y-2">
                {TIME_SLOTS.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setTimeSlot(slot)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm border-2 transition-all ${
                      timeSlot === slot
                        ? "border-navy bg-navy text-white"
                        : "border-cream-dark bg-white text-navy hover:border-navy/30"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <p className="text-red-500 text-sm">{errorMsg}</p>
            )}

            <p className="text-xs text-slate">
              By submitting this form, you agree that our advisor may contact you on the number provided. This is not a sales call — it&apos;s a free, non-binding consultation.
            </p>

            <button
              onClick={handleSubmit}
              disabled={status === "loading"}
              className={`w-full py-4 rounded-xl font-semibold text-base transition-all ${
                status === "loading"
                  ? "bg-cream-dark text-slate cursor-not-allowed"
                  : "btn-gold"
              }`}
            >
              {status === "loading" ? "Booking…" : "Confirm My Free Call →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
