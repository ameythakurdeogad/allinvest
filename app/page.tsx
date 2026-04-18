"use client";
import { useState } from "react";
import Assessment from "@/components/Assessment";
import Results from "@/components/Results";
import LandingPage from "@/components/LandingPage";
import { UserProfile } from "@/lib/recommendations";

type Stage = "landing" | "assessment" | "results";

export default function Home() {
  const [stage, setStage] = useState<Stage>("landing");
  const [profile, setProfile] = useState<UserProfile | null>(null);

  function handleAssessmentComplete(p: UserProfile) {
    setProfile(p);
    setStage("results");
  }

  return (
    <>
      {stage === "landing" && (
        <LandingPage onStart={() => setStage("assessment")} />
      )}
      {stage === "assessment" && (
        <Assessment
          onComplete={handleAssessmentComplete}
          onBack={() => setStage("landing")}
        />
      )}
      {stage === "results" && profile && (
        <Results
          profile={profile}
          onRetake={() => setStage("assessment")}
        />
      )}
    </>
  );
}
