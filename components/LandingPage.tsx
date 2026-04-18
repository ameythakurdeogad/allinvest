"use client";
import { useEffect, useRef } from "react";

interface Props {
  onStart: () => void;
}

const HOW_STEPS = [
  {
    num: "01",
    title: "Tell us about yourself",
    desc: "Answer up to 10 quick questions — takes under 3 minutes. No jargon, no tricks.",
  },
  {
    num: "02",
    title: "Get your personalised plan",
    desc: "We instantly match you to the most relevant plans from our catalogue based on your actual profile.",
  },
  {
    num: "03",
    title: "Book a free expert call",
    desc: "If you want human guidance, book a free 30-minute call with our certified advisors. No pressure, ever.",
  },
];

const TRUST_ITEMS = [
  { val: "9+", label: "Curated plans" },
  { val: "3 min", label: "Assessment time" },
  { val: "100%", label: "Free & unbiased" },
  { val: "0", label: "Sales pressure" },
];

const FAQS = [
  {
    q: "Is this actually free?",
    a: "Yes, completely. We never charge for the assessment or the advisor call.",
  },
  {
    q: "Will someone call me without my permission?",
    a: "Never. We only contact you if you explicitly book a call. No cold calling, no WhatsApp spam.",
  },
  {
    q: "Are these plans from only one insurer?",
    a: "Our current catalogue features Tata AIA plans. We are transparent about this — if a plan from another insurer is better for you, our advisor will tell you so.",
  },
  {
    q: "Is my personal information safe?",
    a: "We don't store your assessment data unless you book a call. Your information is never sold or shared with any third party.",
  },
];

export default function LandingPage({ onStart }: Props) {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 0.7s ease, transform 0.7s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }, []);

  return (
    <div className="min-h-screen mesh-bg">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-cream/80 border-b border-cream-dark">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-navy">
            All-Invest
          </span>
          <button
            onClick={onStart}
            className="btn-primary px-5 py-2 rounded-full text-sm font-medium"
          >
            Start Free Assessment
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <div ref={heroRef}>
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            <span className="text-sm font-medium text-navy">
              Unbiased. Free. No sales pressure.
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-bold text-navy leading-tight mb-6">
            Find the right financial
            <br />
            plan for{" "}
            <span className="relative inline-block">
              <span className="relative z-10">your life.</span>
              <span
                className="absolute bottom-1 left-0 w-full h-3 -z-0 opacity-30"
                style={{ background: "var(--gold)" }}
              />
            </span>
          </h1>

          <p className="text-lg text-slate max-w-xl leading-relaxed mb-10">
            Answer up to 10 questions about your age, family, goals, and risk appetite.
            We instantly show you which plans actually make sense for you — not
            what earns the highest commission.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onStart}
              className="btn-gold px-8 py-4 rounded-xl text-base font-semibold"
            >
              Get My Free Personalised Plan →
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("how")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-8 py-4 rounded-xl text-base font-medium border border-navy/20 text-navy hover:bg-cream-dark transition-colors"
            >
              See how it works
            </button>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-cream-dark bg-white/60">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {TRUST_ITEMS.map((item) => (
            <div key={item.label} className="text-center">
              <div className="font-display text-3xl font-bold text-navy">
                {item.val}
              </div>
              <div className="text-sm text-slate mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-5xl mx-auto px-6 py-20">
        <div className="mb-12">
          <div className="gold-line mb-4" />
          <h2 className="font-display text-3xl font-bold text-navy">
            How it works
          </h2>
          <p className="text-slate mt-2">
            Three steps. No obligation at any stage.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {HOW_STEPS.map((step) => (
            <div key={step.num} className="relative">
              <div className="text-5xl font-display font-bold text-navy/10 mb-4 leading-none">
                {step.num}
              </div>
              <h3 className="font-semibold text-navy text-lg mb-2">
                {step.title}
              </h3>
              <p className="text-slate text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-5xl mx-auto px-6 pb-12">
        <div
          className="rounded-2xl p-10 text-white relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 opacity-10"
            style={{
              background:
                "radial-gradient(circle, var(--gold) 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-2xl font-bold mb-2">
                Ready to find your plan?
              </h2>
              <p className="text-white/70 text-sm">
                3 minutes. Completely free. No account needed.
              </p>
            </div>
            <button
              onClick={onStart}
              className="btn-gold px-8 py-4 rounded-xl text-base font-semibold shrink-0"
            >
              Start the Assessment
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="gold-line mb-4" />
          <h2 className="font-display text-3xl font-bold text-navy">
            Common questions
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {FAQS.map((faq) => (
            <div
              key={faq.q}
              className="bg-white rounded-xl p-6 border border-cream-dark"
            >
              <h3 className="font-semibold text-navy mb-2">{faq.q}</h3>
              <p className="text-slate text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cream-dark mt-12">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate">
          <span className="font-display font-bold text-navy text-lg">
            All-Invest
          </span>
          <span>
            Financial guidance you can trust. Insurance & investment advisors
            certified by NISM
          </span>
        </div>
      </footer>
    </div>
  );
}
