# Income Allocation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an income allocation stacked bar to the Results page, tag each plan with a bucket, force-recommend term and health insurance for users without existing coverage, and add a conditional question to capture existing policy types.

**Architecture:** Pure-logic changes live in `lib/recommendations.ts` and `lib/questions.ts`; UI changes are additive to `components/Results.tsx` and `components/Assessment.tsx`. A new `getAllocation()` function is the single source of truth for allocation percentages. The `existingPolicyTypes` field (multi-select string array) on `UserProfile` drives exclusion of force-recommended plans.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Vitest (added for unit tests)

---

## File Map

| File | Change |
|---|---|
| `package.json` | Add `vitest` + `@vitest/ui` as devDependencies |
| `vitest.config.ts` | New — minimal Vitest config |
| `lib/recommendations.ts` | Add `bucket` to `Plan`; add `existingPolicyTypes?` to `UserProfile`; add `getAllocation()`; update `getRecommendations()` |
| `lib/questions.ts` | Add `existingPolicyType` question at step 9; shift health conditions to step 10 |
| `components/Assessment.tsx` | Update `EMPTY_PROFILE` to use `existingPolicyTypes: []`; update `getActiveQuestions` filter key |
| `components/Results.tsx` | Add `AllocationBar` component; add bucket pill to `PlanCard` |
| `components/LandingPage.tsx` | Update "9 quick questions" copy to "up to 10 quick questions" |
| `lib/__tests__/recommendations.test.ts` | New — unit tests for `getAllocation` and `getRecommendations` |

---

## Task 1: Test infrastructure

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`
- Create: `lib/__tests__/recommendations.test.ts`

- [ ] **Step 1: Install Vitest**

```bash
npm install --save-dev vitest
```

Expected: `vitest` appears in `package.json` devDependencies.

- [ ] **Step 2: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 4: Create the test file with a placeholder test**

Create `lib/__tests__/recommendations.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("placeholder", () => {
  it("true is true", () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 5: Run tests to verify setup works**

```bash
npm test
```

Expected output: `1 passed`

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts package.json package-lock.json lib/__tests__/recommendations.test.ts
git commit -m "chore: add vitest test infrastructure"
```

---

## Task 2: getAllocation function (TDD)

**Files:**
- Modify: `lib/__tests__/recommendations.test.ts`
- Modify: `lib/recommendations.ts`

- [ ] **Step 1: Write failing tests for getAllocation**

Replace the contents of `lib/__tests__/recommendations.test.ts` with:

```ts
import { describe, it, expect } from "vitest";
import { getAllocation } from "@/lib/recommendations";

describe("getAllocation", () => {
  it("returns correct allocation for 18-25 conservative", () => {
    expect(getAllocation("18-25", "conservative")).toEqual({
      protection: 40, stable: 40, market: 20,
    });
  });

  it("returns correct allocation for 18-25 aggressive", () => {
    expect(getAllocation("18-25", "aggressive")).toEqual({
      protection: 25, stable: 20, market: 55,
    });
  });

  it("returns correct allocation for 55+ conservative", () => {
    expect(getAllocation("55+", "conservative")).toEqual({
      protection: 20, stable: 60, market: 20,
    });
  });

  it("returns correct allocation for 46-55 moderate", () => {
    expect(getAllocation("46-55", "moderate")).toEqual({
      protection: 25, stable: 45, market: 30,
    });
  });

  it("each row sums to 100", () => {
    const ages = ["18-25", "26-35", "36-45", "46-55", "55+"] as const;
    const risks = ["conservative", "moderate", "aggressive"] as const;
    for (const age of ages) {
      for (const risk of risks) {
        const { protection, stable, market } = getAllocation(age, risk);
        expect(protection + stable + market).toBe(100);
      }
    }
  });

  it("protection is at least 20 for all profiles", () => {
    const ages = ["18-25", "26-35", "36-45", "46-55", "55+"] as const;
    const risks = ["conservative", "moderate", "aggressive"] as const;
    for (const age of ages) {
      for (const risk of risks) {
        expect(getAllocation(age, risk).protection).toBeGreaterThanOrEqual(20);
      }
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — "getAllocation is not exported from @/lib/recommendations"

- [ ] **Step 3: Add getAllocation to lib/recommendations.ts**

Add this after the `UserProfile` interface (before the `Plan` interface):

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: `5 passed`

- [ ] **Step 5: Commit**

```bash
git add lib/recommendations.ts lib/__tests__/recommendations.test.ts
git commit -m "feat: add getAllocation function with age/risk allocation matrix"
```

---

## Task 3: Add bucket to Plan interface and plan objects (TDD)

**Files:**
- Modify: `lib/__tests__/recommendations.test.ts`
- Modify: `lib/recommendations.ts`

- [ ] **Step 1: Write failing tests for bucket assignments**

Append to `lib/__tests__/recommendations.test.ts`:

```ts
import { PLANS } from "@/lib/recommendations";

describe("Plan bucket assignments", () => {
  it("sampoorna-raksha is protection", () => {
    expect(PLANS.find(p => p.id === "sampoorna-raksha")?.bucket).toBe("protection");
  });

  it("maha-raksha is protection", () => {
    expect(PLANS.find(p => p.id === "maha-raksha")?.bucket).toBe("protection");
  });

  it("shubh-shakti is protection", () => {
    expect(PLANS.find(p => p.id === "shubh-shakti")?.bucket).toBe("protection");
  });

  it("grip is stable", () => {
    expect(PLANS.find(p => p.id === "grip")?.bucket).toBe("stable");
  });

  it("shubh-flexi is stable", () => {
    expect(PLANS.find(p => p.id === "shubh-flexi")?.bucket).toBe("stable");
  });

  it("smart-annuity is stable", () => {
    expect(PLANS.find(p => p.id === "smart-annuity")?.bucket).toBe("stable");
  });

  it("fg-pension-ga1 is stable", () => {
    expect(PLANS.find(p => p.id === "fg-pension-ga1")?.bucket).toBe("stable");
  });

  it("param-raksha is market", () => {
    expect(PLANS.find(p => p.id === "param-raksha")?.bucket).toBe("market");
  });

  it("shubh-health-pro is market", () => {
    expect(PLANS.find(p => p.id === "shubh-health-pro")?.bucket).toBe("market");
  });

  it("every plan has a bucket", () => {
    PLANS.forEach(p => {
      expect(["protection", "stable", "market"]).toContain(p.bucket);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — "bucket does not exist on type Plan"

- [ ] **Step 3: Add bucket to Plan interface**

In `lib/recommendations.ts`, update the `Plan` interface by adding the `bucket` field after `color`:

```ts
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
```

- [ ] **Step 4: Add bucket to every plan object in PLANS array**

In `lib/recommendations.ts`, add the `bucket` field to each plan:

- `sampoorna-raksha`: `bucket: "protection"`
- `shubh-flexi`: `bucket: "stable"`
- `param-raksha`: `bucket: "market"`
- `shubh-shakti`: `bucket: "protection"`
- `maha-raksha`: `bucket: "protection"`
- `grip`: `bucket: "stable"`
- `shubh-health-pro`: `bucket: "market"`
- `fg-pension-ga1`: `bucket: "stable"`
- `smart-annuity`: `bucket: "stable"`

Example — add after `color: "#1a3a6b"` in sampoorna-raksha:
```ts
bucket: "protection",
```

Repeat the pattern for all 9 plans.

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test
```

Expected: all tests pass (previous 5 + 10 new = 15 passed)

- [ ] **Step 6: Commit**

```bash
git add lib/recommendations.ts lib/__tests__/recommendations.test.ts
git commit -m "feat: add bucket field to Plan interface and all plan objects"
```

---

## Task 4: Add existingPolicyTypes to UserProfile (TDD)

**Files:**
- Modify: `lib/__tests__/recommendations.test.ts`
- Modify: `lib/recommendations.ts`
- Modify: `components/Assessment.tsx`

- [ ] **Step 1: Write failing tests for forced term + health logic**

Append to `lib/__tests__/recommendations.test.ts`:

```ts
import { getRecommendations, UserProfile } from "@/lib/recommendations";

const BASE_PROFILE: UserProfile = {
  age: "26-35",
  gender: "male",
  lifeStage: "single",
  income: "6-12L",
  dependents: "0",
  riskAppetite: "moderate",
  goals: ["wealth-creation"],
  hasExistingCover: "no",
  existingPolicyTypes: [],
  healthConditions: "no",
};

describe("getRecommendations forced coverage", () => {
  it("always includes sampoorna-raksha in primary when no existing cover", () => {
    const { primary } = getRecommendations(BASE_PROFILE);
    expect(primary.map(p => p.id)).toContain("sampoorna-raksha");
  });

  it("always includes shubh-health-pro in primary when no existing cover", () => {
    const { primary } = getRecommendations(BASE_PROFILE);
    expect(primary.map(p => p.id)).toContain("shubh-health-pro");
  });

  it("excludes sampoorna-raksha from forced inclusion when user has term", () => {
    const profile: UserProfile = {
      ...BASE_PROFILE,
      hasExistingCover: "yes",
      existingPolicyTypes: ["term"],
    };
    const { primary } = getRecommendations(profile);
    // May still appear due to scoring, but should not be force-boosted.
    // We verify by checking a profile with 0 scoring signals for sampoorna-raksha.
    // The plan should NOT appear since the user has no dependents and no family-protection goal.
    expect(primary.map(p => p.id)).not.toContain("sampoorna-raksha");
  });

  it("excludes shubh-health-pro from forced inclusion when user has health insurance", () => {
    const profile: UserProfile = {
      ...BASE_PROFILE,
      hasExistingCover: "yes",
      existingPolicyTypes: ["health"],
    };
    const { primary } = getRecommendations(profile);
    expect(primary.map(p => p.id)).not.toContain("shubh-health-pro");
  });

  it("still includes sampoorna-raksha when user has health but not term", () => {
    const profile: UserProfile = {
      ...BASE_PROFILE,
      hasExistingCover: "yes",
      existingPolicyTypes: ["health"],
    };
    const { primary } = getRecommendations(profile);
    expect(primary.map(p => p.id)).toContain("sampoorna-raksha");
  });

  it("forces both plans when hasExistingCover is unsure", () => {
    const profile: UserProfile = {
      ...BASE_PROFILE,
      hasExistingCover: "unsure",
      existingPolicyTypes: [],
    };
    const { primary } = getRecommendations(profile);
    expect(primary.map(p => p.id)).toContain("sampoorna-raksha");
    expect(primary.map(p => p.id)).toContain("shubh-health-pro");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `existingPolicyTypes` does not exist on type `UserProfile`

- [ ] **Step 3: Add existingPolicyTypes to UserProfile interface**

In `lib/recommendations.ts`, update `UserProfile`:

```ts
export interface UserProfile {
  age: string;
  gender: string;
  lifeStage: string;
  income: string;
  dependents: string;
  riskAppetite: string;
  goals: string[];
  hasExistingCover: string;
  existingPolicyTypes: string[];
  healthConditions: string;
}
```

- [ ] **Step 4: Add forced coverage logic to getRecommendations**

In `lib/recommendations.ts`, find the `getRecommendations` function. Add these lines **after** the line `PLANS.forEach(p => scores[p.id] = 0);`:

```ts
  const hasTermCover = profile.hasExistingCover === "yes" && profile.existingPolicyTypes?.includes("term");
  const hasHealthCover = profile.hasExistingCover === "yes" && profile.existingPolicyTypes?.includes("health");

  if (!hasTermCover) scores["sampoorna-raksha"] = Math.max(scores["sampoorna-raksha"] ?? 0, 5);
  if (!hasHealthCover) scores["shubh-health-pro"] = Math.max(scores["shubh-health-pro"] ?? 0, 5);
```

These two lines must appear **before** any other scoring logic so the forced minimum is set first and all subsequent scoring only adds on top.

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test
```

Expected: all tests pass

- [ ] **Step 6: Update Assessment.tsx EMPTY_PROFILE and filter condition**

In `components/Assessment.tsx`, change:

```ts
const EMPTY_PROFILE: UserProfile = {
  age: "", gender: "", lifeStage: "", income: "",
  dependents: "", riskAppetite: "", goals: [],
  hasExistingCover: "", existingPolicyType: "", healthConditions: "",
};
```

to:

```ts
const EMPTY_PROFILE: UserProfile = {
  age: "", gender: "", lifeStage: "", income: "",
  dependents: "", riskAppetite: "", goals: [],
  hasExistingCover: "", existingPolicyTypes: [], healthConditions: "",
};
```

Also update the `getActiveQuestions` filter:

```ts
function getActiveQuestions(profile: UserProfile) {
  return QUESTIONS.filter(q =>
    q.id !== "existingPolicyTypes" || profile.hasExistingCover === "yes"
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add lib/recommendations.ts lib/__tests__/recommendations.test.ts components/Assessment.tsx
git commit -m "feat: add existingPolicyTypes to UserProfile, force term+health recommendations"
```

---

## Task 5: Add existingPolicyTypes question to questions.ts

**Files:**
- Modify: `lib/questions.ts`

- [ ] **Step 1: Update healthConditions step number from 9 to 10**

In `lib/questions.ts`, find:

```ts
  {
    id: "healthConditions",
    step: 9,
```

Change to:

```ts
  {
    id: "healthConditions",
    step: 10,
```

- [ ] **Step 2: Insert the new question before healthConditions**

In `lib/questions.ts`, insert the following object **between** the `hasExistingCover` question and the `healthConditions` question (after the closing `},` of the hasExistingCover object):

```ts
  {
    id: "existingPolicyTypes",
    step: 9,
    question: "Which type(s) of insurance do you already have?",
    subtext: "We'll avoid recommending what you already have covered.",
    type: "multi",
    field: "existingPolicyTypes",
    why: "Knowing which plans you already hold lets us skip duplicates and focus on what's missing from your portfolio.",
    options: [
      { value: "term",    label: "Term Life Insurance",      emoji: "🛡️" },
      { value: "health",  label: "Health / Medical Insurance", emoji: "🏥" },
      { value: "ulip",    label: "ULIP / Market-linked Plan",  emoji: "📈" },
      { value: "savings", label: "Savings / Endowment Plan",   emoji: "💰" },
      { value: "pension", label: "Pension / Annuity Plan",     emoji: "🏦" },
    ],
  },
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add lib/questions.ts
git commit -m "feat: add conditional existingPolicyTypes question at step 9"
```

---

## Task 6: Add AllocationBar to Results page

**Files:**
- Modify: `components/Results.tsx`

- [ ] **Step 1: Add getAllocation import**

At the top of `components/Results.tsx`, update the import from `@/lib/recommendations`:

```ts
import { UserProfile, getRecommendations, Plan, getAllocation } from "@/lib/recommendations";
```

- [ ] **Step 2: Add BUCKET_META constant**

After the `PROFILE_LABELS` constant in `components/Results.tsx`, add:

```ts
const BUCKET_META = {
  protection: { label: "Protection", color: "#1a3a6b" },
  stable:     { label: "Stable Growth", color: "#2d6a4f" },
  market:     { label: "Market-Linked", color: "#6b46c1" },
} as const;
```

- [ ] **Step 3: Add AllocationBar component**

After the `BUCKET_META` constant and before the `PlanCard` function, add:

```tsx
function AllocationBar({ profile }: { profile: UserProfile }) {
  const alloc = getAllocation(profile.age, profile.riskAppetite);
  const segments: { key: keyof typeof BUCKET_META; pct: number }[] = [
    { key: "protection", pct: alloc.protection },
    { key: "stable",     pct: alloc.stable },
    { key: "market",     pct: alloc.market },
  ];

  return (
    <div className="bg-white rounded-2xl border border-cream-dark p-6 mb-6">
      <p className="font-semibold text-navy text-sm mb-0.5">How to spread your investable income</p>
      <p className="text-xs text-slate mb-4">Based on your age and risk appetite</p>
      <div className="flex rounded-lg overflow-hidden h-8 mb-3">
        {segments.map(({ key, pct }) => (
          <div
            key={key}
            style={{ width: `${pct}%`, background: BUCKET_META[key].color }}
            className="flex items-center justify-center"
          >
            <span className="text-white text-xs font-semibold">{pct}%</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 flex-wrap">
        {segments.map(({ key, pct }) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: BUCKET_META[key].color }}
            />
            <span className="text-xs text-slate">{BUCKET_META[key].label}</span>
            <span className="text-xs font-semibold text-navy">{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Insert AllocationBar in the Results render**

In the `Results` component, find the goal filters block:

```tsx
        {/* Goal filters */}
        {profile.goals.length > 1 && (
```

Insert the `AllocationBar` directly **before** this block:

```tsx
        {/* Allocation bar */}
        {profile.age && profile.riskAppetite && (
          <AllocationBar profile={profile} />
        )}

        {/* Goal filters */}
        {profile.goals.length > 1 && (
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add components/Results.tsx
git commit -m "feat: add income allocation stacked bar to Results page"
```

---

## Task 7: Add bucket pill to PlanCard

**Files:**
- Modify: `components/Results.tsx`

- [ ] **Step 1: Add bucket pill to PlanCard header**

In `components/Results.tsx`, inside the `PlanCard` function, find the line:

```tsx
            <p className="text-xs text-slate mt-0.5">{plan.type}</p>
```

Replace it with:

```tsx
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <p className="text-xs text-slate">{plan.type}</p>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                style={{ background: BUCKET_META[plan.bucket].color }}
              >
                {BUCKET_META[plan.bucket].label}
              </span>
            </div>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/Results.tsx
git commit -m "feat: add bucket pill to plan cards"
```

---

## Task 8: Update LandingPage copy

**Files:**
- Modify: `components/LandingPage.tsx`

- [ ] **Step 1: Update hero paragraph**

In `components/LandingPage.tsx`, find:

```tsx
            Answer 9 questions about your age, family, goals, and risk appetite.
```

Replace with:

```tsx
            Answer up to 10 questions about your age, family, goals, and risk appetite.
```

- [ ] **Step 2: Update HOW_STEPS description**

In `components/LandingPage.tsx`, find:

```ts
    desc: "Answer 9 quick questions — takes under 3 minutes. No jargon, no tricks.",
```

Replace with:

```ts
    desc: "Answer up to 10 quick questions — takes under 3 minutes. No jargon, no tricks.",
```

- [ ] **Step 3: Commit**

```bash
git add components/LandingPage.tsx
git commit -m "chore: update question count copy for conditional question"
```

---

## Task 9: Final verification

- [ ] **Step 1: Run the full test suite**

```bash
npm test
```

Expected: all tests pass

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Run the dev server and manually verify**

```bash
npm run dev
```

Verify manually:
1. Complete assessment with `hasExistingCover = "no"` → Results show Sampoorna Raksha and Shubh Health Pro in primary
2. Complete assessment with `hasExistingCover = "yes"` → Step 9 appears asking policy types
3. Select "Term Life" + "Health" → Results do NOT force-include those two plans
4. Select only "Term Life" → Results include Shubh Health Pro but not force Sampoorna Raksha
5. Allocation bar appears on Results page with correct colors and percentages summing to 100
6. Each plan card shows its bucket pill (Protection / Stable Growth / Market-Linked)
