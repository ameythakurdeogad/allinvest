"use client";
import { useState } from "react";
import { QUESTIONS } from "@/lib/questions";
import { UserProfile } from "@/lib/recommendations";

interface Props {
  onComplete: (profile: UserProfile) => void;
  onBack: () => void;
}

const EMPTY_PROFILE: UserProfile = {
  age: "", gender: "", lifeStage: "", income: "",
  dependents: "", riskAppetite: "", goals: [],
  hasExistingCover: "", existingPolicyType: "", healthConditions: "",
};

function getActiveQuestions(profile: UserProfile) {
  return QUESTIONS.filter(q =>
    q.id !== "existingPolicyType" || profile.hasExistingCover === "yes"
  );
}

export default function Assessment({ onComplete, onBack }: Props) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [showWhy, setShowWhy] = useState(false);
  const [animDir, setAnimDir] = useState<"forward" | "back">("forward");
  const [visible, setVisible] = useState(true);

  const activeQuestions = getActiveQuestions(profile);
  const q = activeQuestions[step];
  const totalSteps = activeQuestions.length;
  const progress = ((step) / totalSteps) * 100;

  const currentValue = profile[q.field as keyof UserProfile];
  const isAnswered = q.type === "multi"
    ? (currentValue as string[]).length > 0
    : currentValue !== "";

  function handleSingle(val: string) {
    setProfile(prev => ({ ...prev, [q.field]: val }));
  }

  function handleMulti(val: string) {
    const field = q.field as keyof UserProfile;
    const current = (profile[field] as string[]) || [];
    if (current.includes(val)) {
      setProfile(prev => ({ ...prev, [field]: current.filter((v: string) => v !== val) }));
    } else {
      setProfile(prev => ({ ...prev, [field]: [...current, val] }));
    }
  }

  function goNext() {
    if (!isAnswered) return;
    if (step === totalSteps - 1) {
      onComplete(profile);
      return;
    }
    setAnimDir("forward");
    setVisible(false);
    setTimeout(() => {
      setStep(s => s + 1);
      setShowWhy(false);
      setVisible(true);
    }, 180);
  }

  function goBack() {
    if (step === 0) { onBack(); return; }
    setAnimDir("back");
    setVisible(false);
    setTimeout(() => {
      setStep(s => s - 1);
      setShowWhy(false);
      setVisible(true);
    }, 180);
  }

  const slideStyle: React.CSSProperties = {
    transition: "opacity 0.18s ease, transform 0.18s ease",
    opacity: visible ? 1 : 0,
    transform: visible ? "translateX(0)" : animDir === "forward" ? "translateX(-16px)" : "translateX(16px)",
  };

  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-cream/90 backdrop-blur border-b border-cream-dark">
        <div className="max-w-xl mx-auto px-6 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <button onClick={goBack} className="text-sm text-slate hover:text-navy flex items-center gap-1">
              ← Back
            </button>
            <span className="text-sm text-slate font-medium">{step + 1} of {totalSteps}</span>
          </div>
          <div className="w-full bg-cream-dark rounded-full overflow-hidden">
            <div className="progress-bar rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-start justify-center px-6 py-10">
        <div className="w-full max-w-xl" style={slideStyle}>

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-3">
              Question {step + 1}
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-navy leading-tight mb-2">
              {q.question}
            </h2>
            {q.subtext && (
              <p className="text-slate text-sm leading-relaxed">{q.subtext}</p>
            )}
            {q.why && (
              <button
                onClick={() => setShowWhy(s => !s)}
                className="mt-2 text-xs text-gold underline underline-offset-2"
              >
                {showWhy ? "Hide" : "Why do we ask this?"}
              </button>
            )}
            {showWhy && q.why && (
              <div className="mt-2 bg-gold/10 border border-gold/20 rounded-lg px-4 py-3 text-sm text-navy">
                {q.why}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 mb-10">
            {q.options.map(opt => {
              const selected = q.type === "multi"
                ? (currentValue as string[]).includes(opt.value)
                : currentValue === opt.value;

              return (
                <button
                  key={opt.value}
                  onClick={() => q.type === "multi" ? handleMulti(opt.value) : handleSingle(opt.value)}
                  className={[
                    "w-full text-left rounded-xl border-2 px-5 py-4 flex items-center gap-4 transition-all duration-150",
                    selected
                      ? "border-navy bg-navy text-white"
                      : "border-cream-dark bg-white text-navy hover:border-navy/40",
                  ].join(" ")}
                >
                  <span className="text-2xl shrink-0">{opt.emoji}</span>
                  <div>
                    <div className="font-medium">{opt.label}</div>
                    {opt.sublabel && (
                      <div className={`text-xs mt-0.5 ${selected ? "text-white/70" : "text-slate"}`}>
                        {opt.sublabel}
                      </div>
                    )}
                  </div>
                  {selected && (
                    <span className="ml-auto shrink-0">
                      {q.type === "multi" ? "✓" : "●"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <button
            onClick={goNext}
            disabled={!isAnswered}
            className={[
              "w-full py-4 rounded-xl font-semibold text-base transition-all",
              isAnswered
                ? "btn-gold cursor-pointer"
                : "bg-cream-dark text-slate/40 cursor-not-allowed",
            ].join(" ")}
          >
            {step === totalSteps - 1 ? "See my personalised plans →" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
