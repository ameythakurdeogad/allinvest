"use client";
import { useState } from "react";
import { UserProfile, getRecommendations, Plan } from "@/lib/recommendations";
import BookingModal from "@/components/BookingModal";

interface Props {
  profile: UserProfile;
  onRetake: () => void;
}

const GOAL_LABELS: Record<string, string> = {
  "family-protection": "Family Protection",
  "wealth-creation": "Wealth Growth",
  "retirement": "Retirement",
  "tax-saving": "Tax Saving",
  "health-corpus": "Health Corpus",
  "regular-income": "Regular Income",
  "guaranteed-returns": "Guaranteed Returns",
  "child-education": "Child Education",
};

const PROFILE_LABELS: Record<string, Record<string, string>> = {
  age: { "18-25": "18–25 yrs", "26-35": "26–35 yrs", "36-45": "36–45 yrs", "46-55": "46–55 yrs", "55+": "55+ yrs" },
  gender: { male: "Male", female: "Female", other: "Other" },
  lifeStage: { single: "Single", married: "Married", "married-kids": "Married with kids", "single-parent": "Single parent" },
  riskAppetite: { conservative: "Conservative", moderate: "Moderate risk", aggressive: "Growth-focused" },
};

function PlanCard({ plan, profile, rank, onBook }: { plan: Plan; profile: UserProfile; rank: number; onBook: (plan: Plan) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="plan-card bg-white rounded-2xl border border-cream-dark overflow-hidden">
      {/* Card header */}
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: `${plan.color}18` }}
          >
            {plan.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {rank === 1 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gold/20 text-gold-dark border border-gold/30">
                  Top Match
                </span>
              )}
              {plan.highlight && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                  style={{ background: plan.color }}
                >
                  {plan.highlight}
                </span>
              )}
            </div>
            <h3 className="font-display font-bold text-navy text-lg leading-tight">{plan.shortName}</h3>
            <p className="text-xs text-slate mt-0.5">{plan.type}</p>
          </div>
        </div>

        <p className="text-navy/80 text-sm leading-relaxed mb-4">{plan.tagline}</p>

        {/* Key benefits preview */}
        <ul className="space-y-1.5 mb-4">
          {plan.keyBenefits.slice(0, 3).map(b => (
            <li key={b} className="flex items-start gap-2 text-sm text-slate">
              <span className="text-gold mt-0.5 shrink-0">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between">
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: `${plan.color}15`, color: plan.color }}
          >
            {plan.bestFor}
          </span>
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-sm text-navy underline underline-offset-2"
          >
            {expanded ? "Show less" : "Learn more"}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-cream-dark bg-cream/50 p-6">
          <p className="text-sm text-slate leading-relaxed mb-4">{plan.description}</p>
          <h4 className="font-semibold text-navy text-sm mb-2">All key benefits</h4>
          <ul className="space-y-1.5 mb-4">
            {plan.keyBenefits.map(b => (
              <li key={b} className="flex items-start gap-2 text-sm text-slate">
                <span className="text-gold mt-0.5 shrink-0">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="bg-navy/5 rounded-xl p-4 text-sm">
            <p className="font-semibold text-navy mb-1">Why we recommended this for you</p>
            <p className="text-slate">
              Based on your profile — {PROFILE_LABELS.age[profile.age]},{" "}
              {PROFILE_LABELS.lifeStage[profile.lifeStage]},{" "}
              goals: {profile.goals.map(g => GOAL_LABELS[g]).join(", ")} —
              this plan directly addresses what matters most to you right now.
            </p>
          </div>
        </div>
      )}

      {/* Book CTA */}
      <div className="px-6 pb-6 pt-2">
        <button
          onClick={() => onBook(plan)}
          className="w-full btn-primary py-3 rounded-xl font-semibold text-sm"
        >
          Book a Free Call About This Plan
        </button>
      </div>
    </div>
  );
}

export default function Results({ profile, onRetake }: Props) {
  const { primary, secondary } = getRecommendations(profile);
  const [activeGoal, setActiveGoal] = useState<string>("all");
  const [bookedPlan, setBookedPlan] = useState<Plan | null>(null);
  const [globalBookOpen, setGlobalBookOpen] = useState(false);

  const filteredPlans = activeGoal === "all"
    ? primary
    : primary.filter(p =>
        p.bestFor.toLowerCase().includes(activeGoal.replace("-", " ").toLowerCase()) ||
        p.keyBenefits.some(b => b.toLowerCase().includes(activeGoal.replace("-", " ")))
      );

  const displayPlans = filteredPlans.length > 0 ? filteredPlans : primary;

  return (
    <div className="min-h-screen mesh-bg">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-cream/80 border-b border-cream-dark">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-navy">All-Invest</span>
          <button
            onClick={onRetake}
            className="text-sm text-slate hover:text-navy"
          >
            ← Retake assessment
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="gold-line mb-4" />
          <h1 className="font-display text-3xl md:text-4xl font-bold text-navy mb-3">
            Your personalised plan shortlist
          </h1>
          <p className="text-slate text-sm mb-4">
            Based on your profile, here are the plans most relevant to you.
          </p>

          {/* Profile summary pills */}
          <div className="flex flex-wrap gap-2">
            {profile.age && (
              <span className="text-xs px-3 py-1 rounded-full bg-navy/8 text-navy border border-navy/15 font-medium">
                {PROFILE_LABELS.age[profile.age]}
              </span>
            )}
            {profile.lifeStage && (
              <span className="text-xs px-3 py-1 rounded-full bg-navy/8 text-navy border border-navy/15 font-medium">
                {PROFILE_LABELS.lifeStage[profile.lifeStage]}
              </span>
            )}
            {profile.riskAppetite && (
              <span className="text-xs px-3 py-1 rounded-full bg-navy/8 text-navy border border-navy/15 font-medium">
                {PROFILE_LABELS.riskAppetite[profile.riskAppetite]}
              </span>
            )}
            {profile.goals.map(g => (
              <span key={g} className="text-xs px-3 py-1 rounded-full bg-gold/15 text-navy border border-gold/25 font-medium">
                {GOAL_LABELS[g]}
              </span>
            ))}
          </div>
        </div>

        {/* Goal filters */}
        {profile.goals.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-6">
            <button
              onClick={() => setActiveGoal("all")}
              className={`goal-pill text-sm px-4 py-1.5 rounded-full border font-medium ${
                activeGoal === "all"
                  ? "bg-navy text-white border-navy"
                  : "bg-white text-navy border-cream-dark"
              }`}
            >
              All
            </button>
            {profile.goals.map(g => (
              <button
                key={g}
                onClick={() => setActiveGoal(g)}
                className={`goal-pill text-sm px-4 py-1.5 rounded-full border font-medium ${
                  activeGoal === g
                    ? "bg-navy text-white border-navy"
                    : "bg-white text-navy border-cream-dark"
                }`}
              >
                {GOAL_LABELS[g]}
              </button>
            ))}
          </div>
        )}

        {/* Plan cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {displayPlans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} profile={profile} rank={i + 1} onBook={setBookedPlan} />
          ))}
        </div>

        {/* Global CTA banner */}
        <div
          className="rounded-2xl p-8 text-white relative overflow-hidden mb-10"
          style={{ background: "linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)" }}
        >
          <div className="absolute top-0 right-0 w-56 h-56 opacity-10"
            style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }} />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 justify-between">
            <div>
              <h2 className="font-display text-xl font-bold mb-1">Not sure which plan to pick?</h2>
              <p className="text-white/70 text-sm">
                Book a free 30-minute call with our advisor. They will walk you through your shortlist and answer every question. No pressure, no obligation.
              </p>
            </div>
            <button
              onClick={() => setGlobalBookOpen(true)}
              className="btn-gold px-7 py-3.5 rounded-xl font-semibold text-sm shrink-0"
            >
              Book Free Advisor Call
            </button>
          </div>
        </div>

        {/* Secondary plans */}
        {secondary.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-bold text-navy mb-2">Other plans in our catalogue</h2>
            <p className="text-sm text-slate mb-4">
              These didn&apos;t rank highly for your current profile, but your advisor can explain when they might be relevant.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {secondary.map(plan => (
                <div key={plan.id} className="bg-white rounded-xl border border-cream-dark p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{plan.icon}</span>
                    <span className="font-semibold text-navy text-sm">{plan.shortName}</span>
                  </div>
                  <p className="text-xs text-slate">{plan.type}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {bookedPlan && (
        <BookingModal
          preselectedPlan={bookedPlan.shortName}
          profile={profile}
          onClose={() => setBookedPlan(null)}
        />
      )}

      {globalBookOpen && (
        <BookingModal
          profile={profile}
          onClose={() => setGlobalBookOpen(false)}
        />
      )}
    </div>
  );
}
