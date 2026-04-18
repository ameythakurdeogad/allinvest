export interface UserProfile {
  age: string;          // "18-25" | "26-35" | "36-45" | "46-55" | "55+"
  gender: string;       // "male" | "female" | "other"
  lifeStage: string;    // "single" | "married" | "married-kids" | "single-parent"
  income: string;       // "<3L" | "3-6L" | "6-12L" | "12-25L" | "25-50L" | "50L+"
  dependents: string;   // "0" | "1-2" | "3+"
  riskAppetite: string; // "conservative" | "moderate" | "aggressive"
  goals: string[];      // multi-select
  hasExistingCover: string;    // "yes" | "no" | "unsure"
  existingPolicyType: string;  // shown only when hasExistingCover === "yes"
  healthConditions: string;    // "yes" | "no"
}

type AgeGroup = "18-25" | "26-35" | "36-45" | "46-55" | "55+";
type RiskAppetite = "conservative" | "moderate" | "aggressive";

const ALLOCATION_MATRIX: Record<AgeGroup, Record<RiskAppetite, { protection: number; stable: number; market: number }>> = {
  "18-25": {
    conservative: { protection: 40, stable: 40, market: 20 },
    moderate:     { protection: 35, stable: 30, market: 35 },
    aggressive:   { protection: 25, stable: 20, market: 55 },
  },
  "26-35": {
    conservative: { protection: 40, stable: 35, market: 25 },
    moderate:     { protection: 35, stable: 30, market: 35 },
    aggressive:   { protection: 25, stable: 20, market: 55 },
  },
  "36-45": {
    conservative: { protection: 35, stable: 40, market: 25 },
    moderate:     { protection: 30, stable: 35, market: 35 },
    aggressive:   { protection: 25, stable: 30, market: 45 },
  },
  "46-55": {
    conservative: { protection: 30, stable: 50, market: 20 },
    moderate:     { protection: 25, stable: 45, market: 30 },
    aggressive:   { protection: 20, stable: 40, market: 40 },
  },
  "55+": {
    conservative: { protection: 20, stable: 60, market: 20 },
    moderate:     { protection: 20, stable: 55, market: 25 },
    aggressive:   { protection: 20, stable: 50, market: 30 },
  },
};

export function getAllocation(age: string, riskAppetite: string): { protection: number; stable: number; market: number } {
  const row = ALLOCATION_MATRIX[age as AgeGroup];
  if (!row) return { protection: 35, stable: 35, market: 30 };
  return row[riskAppetite as RiskAppetite] ?? { protection: 35, stable: 35, market: 30 };
}

export interface Plan {
  id: string;
  name: string;
  shortName: string;
  type: string;
  tagline: string;
  description: string;
  keyBenefits: string[];
  bestFor: string;
  icon: string;
  color: string;
  bucket: "protection" | "stable" | "market";
  highlight?: string;
}

export const PLANS: Plan[] = [
  {
    id: "sampoorna-raksha",
    name: "Tata AIA Sampoorna Raksha Promise",
    shortName: "Sampoorna Raksha",
    type: "Pure Term Insurance",
    tagline: "Complete protection for everyone you love",
    description: "A pure term plan that pays your family a lump sum if you're no longer there. No investment component — just straightforward, affordable cover for the people who depend on you.",
    keyBenefits: [
      "Multiple death benefit payout options",
      "Whole life cover available",
      "50% payout on terminal illness diagnosis",
      "Premium waiver on critical illness",
      "Optional spouse coverage",
      "Instant claim support"
    ],
    bestFor: "Family Protection",
    icon: "🛡️",
    color: "#1a3a6b",
    bucket: "protection",
    highlight: "Most recommended for families"
  },
  {
    id: "shubh-flexi",
    name: "Tata AIA Shubh Flexi Income Plan",
    shortName: "Shubh Flexi Income",
    type: "Savings + Income Plan",
    tagline: "Guaranteed income that starts when you need it",
    description: "A flexible savings plan with three modes: lump sum at maturity, income that starts early, or income that kicks in at retirement. Pick the mode that matches your life.",
    keyBenefits: [
      "Three income options: Early, Deferred, or Lump Sum",
      "Guaranteed returns — locked at policy start",
      "Endowment option: lump sum payout timed to child's education milestones",
      "Regular income for monthly cash flow needs",
      "Ideal for retirement income planning",
      "Life cover included throughout"
    ],
    bestFor: "Regular Cash Flow, Retirement & Child Education",
    icon: "💰",
    color: "#2d6a4f",
    bucket: "stable",
  },
  {
    id: "param-raksha",
    name: "Tata AIA Param Raksha",
    shortName: "Param Raksha",
    type: "ULIP — Market-Linked",
    tagline: "Grow wealth and stay protected at the same time",
    description: "A unit-linked plan that invests your premium in market-linked funds while keeping life cover active. Choose your fund mix based on how much risk you're comfortable with.",
    keyBenefits: [
      "Invest as per your risk appetite",
      "Market-linked wealth growth potential",
      "Life insurance protection included",
      "Top-up investment option available",
      "Systematic withdrawal facility",
      "Tax benefits under applicable laws"
    ],
    bestFor: "Long-Term Wealth Creation",
    icon: "📈",
    color: "#6b46c1",
    bucket: "market",
  },
  {
    id: "shubh-shakti",
    name: "Tata AIA Shubh Shakti",
    shortName: "Shubh Shakti",
    type: "Women's Protection Plan",
    tagline: "Built specifically for women's financial security",
    description: "A protection plan designed around the realities of women's lives — lower premiums, health screenings, pregnancy support, and provisions for single mothers and child education.",
    keyBenefits: [
      "Lower premium rates for women",
      "Full life cover protection",
      "Annual health checkups included",
      "Women-specific screenings (cancer, PCOS)",
      "Flexible premium break for pregnancy",
      "Child education protection benefit",
      "Tax benefits under 80C and 10(10D)"
    ],
    bestFor: "Women's Protection & Health",
    icon: "✨",
    color: "#b83280",
    bucket: "protection",
    highlight: "Designed for women"
  },
  {
    id: "maha-raksha",
    name: "Tata AIA Maha Raksha Supreme Select",
    shortName: "Maha Raksha Supreme",
    type: "High-Value Term Plan",
    tagline: "Premium protection for high-income individuals",
    description: "A high-cover term plan for those earning ₹15L+ who need serious financial protection. Covers starting at ₹2 Crore with advanced underwriting and life-stage top-up options.",
    keyBenefits: [
      "Coverage starting from ₹2 Crore",
      "Designed for income ₹15L and above",
      "Terminal illness benefit",
      "Life Stage Protection Option (LSPO)",
      "Enhanced underwriting for high cover",
      "Covers standard and sub-standard lives"
    ],
    bestFor: "High-Income Individuals",
    icon: "👑",
    color: "#92400e",
    bucket: "protection",
  },
  {
    id: "grip",
    name: "Tata AIA Guaranteed Return Insurance Plan",
    shortName: "GRIP",
    type: "Guaranteed Savings Plan",
    tagline: "Lock in your returns. Sleep easy.",
    description: "For those who want zero surprises. Returns are guaranteed at policy start, so you always know exactly what you'll get at maturity. No market risk, no guesswork.",
    keyBenefits: [
      "Returns guaranteed at policy start",
      "Zero market risk",
      "Endowment option: plan maturity aligned to child's college entry",
      "Single or limited premium payment",
      "Lump sum maturity payout",
      "Life cover throughout the policy",
      "Ideal for conservative investors"
    ],
    bestFor: "Guaranteed Growth & Child Education",
    icon: "🔒",
    color: "#065f46",
    bucket: "stable",
  },
  {
    id: "shubh-health-pro",
    name: "Tata AIA Shubh Health Pro",
    shortName: "Shubh Health Pro",
    type: "Market-Linked Health Plan",
    tagline: "Build a medical corpus that beats inflation",
    description: "A specialised market-linked plan to build a dedicated health fund. Zero premium allocation charge means 100% of your money goes to work from day one. Designed for rising healthcare costs.",
    keyBenefits: [
      "Zero premium allocation charge",
      "100% of premium invested from day one",
      "Market-linked growth for medical inflation",
      "Accidental disability lump sum",
      "Optional cancer and critical illness cover",
      "Tax-free withdrawals for medical expenses"
    ],
    bestFor: "Medical Corpus Building",
    icon: "🏥",
    color: "#0369a1",
    bucket: "market",
    highlight: "Best for professionals"
  },
  {
    id: "fg-pension-ga1",
    name: "FG Pension GA-1 Plan",
    shortName: "FG Pension GA-1",
    type: "Pension + Protection Plan",
    tagline: "Insurance and pension — even if you start at 65",
    description: "The only plan in the market that offers life insurance cover up to age 65, making it ideal for clients who delayed retirement planning. Combines the dual benefit of family protection with guaranteed pension income, so you never have to choose one over the other.",
    keyBenefits: [
      "Insurance cover available even at age 65",
      "Best-in-market option for late retirement planning",
      "Dual benefit: life protection + guaranteed pension",
      "Flexible premium payment options",
      "Guaranteed retirement income for life",
      "Financial security for family throughout"
    ],
    bestFor: "Late Retirement Planning",
    icon: "🏦",
    color: "#7c3aed",
    bucket: "stable",
    highlight: "Best for age 50+"
  },
  {
    id: "smart-annuity",
    name: "Tata AIA Smart Annuity Plan",
    shortName: "Smart Annuity",
    type: "Guaranteed Annuity Plan",
    tagline: "7.35% guaranteed lifetime income — better than FD",
    description: "A guaranteed annuity plan that converts your lump sum (PF, gratuity, or savings) into a steady lifetime income at 7.35% — significantly better than fixed deposit rates. Ideal for retirees who want zero market risk and predictable monthly income for life.",
    keyBenefits: [
      "Guaranteed lifetime income at 7.35% — beats FD rates",
      "Ideal for deploying PF, gratuity, or retirement corpus",
      "Multiple annuity payout options",
      "Single life and joint life (spouse) options",
      "Flexible premium payment modes",
      "Flexible income payout frequency (monthly/quarterly/annual)"
    ],
    bestFor: "Guaranteed Lifetime Income",
    icon: "📊",
    color: "#0f766e",
    bucket: "stable",
    highlight: "Better than FD"
  },
];

export function getRecommendations(profile: UserProfile): { primary: Plan[]; secondary: Plan[] } {
  const scores: Record<string, number> = {};
  PLANS.forEach(p => scores[p.id] = 0);

  const incomeHigh = ["12-25L", "25-50L", "50L+"].includes(profile.income);
  const incomeVeryHigh = ["25-50L", "50L+"].includes(profile.income);
  const hasDependent = ["1-2", "3+"].includes(profile.dependents);
  const ageYoung = ["18-25", "26-35"].includes(profile.age);
  const ageMid = ["36-45"].includes(profile.age);
  const ageOld = ["46-55", "55+"].includes(profile.age);

  // Sampoorna Raksha — triggered by dependents + any income
  if (hasDependent) scores["sampoorna-raksha"] += 3;
  if (profile.lifeStage === "married" || profile.lifeStage === "married-kids") scores["sampoorna-raksha"] += 2;
  if (profile.lifeStage === "single-parent") scores["sampoorna-raksha"] += 3;
  if (profile.goals.includes("family-protection")) scores["sampoorna-raksha"] += 3;
  if (!incomeVeryHigh) scores["sampoorna-raksha"] += 1; // more relevant for mid-income

  // Maha Raksha — high income + high cover need
  if (incomeVeryHigh) scores["maha-raksha"] += 4;
  if (incomeHigh && hasDependent) scores["maha-raksha"] += 2;
  if (profile.goals.includes("family-protection") && incomeHigh) scores["maha-raksha"] += 2;

  // GRIP — conservative, guaranteed, child education
  if (profile.riskAppetite === "conservative") scores["grip"] += 4;
  if (profile.goals.includes("guaranteed-returns")) scores["grip"] += 3;
  if (profile.goals.includes("child-education")) scores["grip"] += 4;
  if (ageOld) scores["grip"] += 2;
  if (profile.goals.includes("tax-saving")) scores["grip"] += 1;

  // Shubh Flexi — retirement or regular income or child education
  if (profile.goals.includes("retirement")) scores["shubh-flexi"] += 3;
  if (profile.goals.includes("regular-income")) scores["shubh-flexi"] += 3;
  if (profile.goals.includes("child-education")) scores["shubh-flexi"] += 4;
  if (ageOld || ageMid) scores["shubh-flexi"] += 2;

  // Param Raksha — aggressive or moderate + wealth
  if (profile.riskAppetite === "aggressive") scores["param-raksha"] += 3;
  if (profile.riskAppetite === "moderate") scores["param-raksha"] += 1;
  if (profile.goals.includes("wealth-creation")) scores["param-raksha"] += 3;
  if (ageYoung || ageMid) scores["param-raksha"] += 1;

  // Shubh Shakti — female
  if (profile.gender === "female") scores["shubh-shakti"] += 5;
  if (profile.lifeStage === "single-parent") scores["shubh-shakti"] += 2;
  if (profile.goals.includes("health-corpus") && profile.gender === "female") scores["shubh-shakti"] += 2;

  // Shubh Health Pro — health corpus goal
  if (profile.goals.includes("health-corpus")) scores["shubh-health-pro"] += 4;
  if (incomeHigh) scores["shubh-health-pro"] += 2;
  if (profile.healthConditions === "yes") scores["shubh-health-pro"] += 2;

  // FG Pension GA-1 — late retirement planning, older age
  if (profile.goals.includes("retirement")) scores["fg-pension-ga1"] += 3;
  if (profile.age === "46-55") scores["fg-pension-ga1"] += 3;
  if (profile.age === "55+") scores["fg-pension-ga1"] += 5;
  if (hasDependent) scores["fg-pension-ga1"] += 2;
  if (profile.goals.includes("family-protection") && ageOld) scores["fg-pension-ga1"] += 2;

  // Smart Annuity — guaranteed income, PF deployment, conservative retirees
  if (profile.goals.includes("guaranteed-returns")) scores["smart-annuity"] += 3;
  if (profile.goals.includes("regular-income")) scores["smart-annuity"] += 3;
  if (profile.goals.includes("retirement")) scores["smart-annuity"] += 2;
  if (profile.riskAppetite === "conservative") scores["smart-annuity"] += 2;
  if (ageOld) scores["smart-annuity"] += 3;

  // Sort all plans by score
  const sorted = PLANS
    .map(p => ({ plan: p, score: scores[p.id] }))
    .sort((a, b) => b.score - a.score);

  const primary = sorted.filter(x => x.score >= 3).slice(0, 4).map(x => x.plan);
  const secondary = sorted.filter(x => x.score < 3 && x.score >= 0).map(x => x.plan);

  // Fallback: always show at least 2
  if (primary.length < 2) {
    const top = sorted.slice(0, 3).map(x => x.plan);
    return { primary: top, secondary: [] };
  }

  return { primary, secondary };
}
