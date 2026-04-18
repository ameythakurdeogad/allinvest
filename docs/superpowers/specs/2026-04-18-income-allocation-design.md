# Income Allocation & Forced Coverage Design

**Date:** 2026-04-18
**Status:** Approved

## Overview

Three interconnected changes to the FinPlan recommendation flow:

1. **Income allocation bar** — horizontal stacked bar on the Results page showing how to spread investable income across Protection, Stable Growth, and Market-Linked buckets. Percentages vary by age and risk appetite.
2. **Forced term + health recommendations** — everyone always gets Sampoorna Raksha (term) and Shubh Health Pro (health) in their primary recommendations, unless their existing policy already covers that type.
3. **New existing policy type question** — when a user says they already have insurance, a new multi-select question captures which types they hold, so we can skip duplicates.

---

## 1. Bucket Assignments

Each plan belongs to exactly one bucket:

| Bucket | Plans |
|---|---|
| Protection | Sampoorna Raksha, Maha Raksha Supreme, Shubh Shakti |
| Stable Growth | GRIP, Shubh Flexi Income, Smart Annuity, FG Pension GA-1 |
| Market-Linked | Param Raksha, Shubh Health Pro |

The `Plan` interface in `lib/recommendations.ts` gets a new `bucket` field: `"protection" | "stable" | "market"`.

---

## 2. Allocation Matrix

Percentages represent the recommended share of investable income per bucket.
Format: `Protection % / Stable Growth % / Market-Linked %`

| Age | Conservative | Moderate | Aggressive |
|---|---|---|---|
| 18–25 | 40 / 40 / 20 | 35 / 30 / 35 | 25 / 20 / 55 |
| 26–35 | 40 / 35 / 25 | 35 / 30 / 35 | 25 / 20 / 55 |
| 36–45 | 35 / 40 / 25 | 30 / 35 / 35 | 25 / 30 / 45 |
| 46–55 | 30 / 50 / 20 | 25 / 45 / 30 | 20 / 40 / 40 |
| 55+   | 20 / 60 / 20 | 20 / 55 / 25 | 20 / 50 / 30 |

**Principles:**
- Protection floor: 20% minimum regardless of age or risk
- Younger + aggressive profiles skew heavily market-linked (up to 55%)
- 55+ profiles shift majority to stable growth

A new function `getAllocation(age, riskAppetite): { protection: number, stable: number, market: number }` is added to `lib/recommendations.ts`.

---

## 3. UI — Allocation Bar

**Location:** Results page, between the profile summary pills and the goal filter pills.

**Visual:** Horizontal stacked bar with three colored segments:
- Navy (`#1a3a6b`) = Protection
- Green (`#2d6a4f`) = Stable Growth
- Purple (`#6b46c1`) = Market-Linked

Each segment shows its percentage label inline. A legend row below shows color dot + bucket name.

**Headline:** *"How to spread your investable income"*
**Subline:** *"Based on your age and risk appetite"*

No per-plan individual percentage is shown — the top bar communicates the full picture. Per-plan % would confuse users when multiple plans share a bucket.

**Per-plan bucket tag:** Each PlanCard gets a small colored pill in the card header (next to the plan type line) showing its bucket name.

---

## 4. Forced Term + Health Recommendations

**Rule:** `sampoorna-raksha` and `shubh-health-pro` always appear in primary recommendations with a minimum score of 5, overriding the normal scoring threshold of 3.

**Exclusion logic:**
- Skip forcing `sampoorna-raksha` if `profile.hasExistingCover === "yes"` AND `profile.existingPolicyTypes?.includes("term")`
- Skip forcing `shubh-health-pro` if `profile.hasExistingCover === "yes"` AND `profile.existingPolicyTypes?.includes("health")`

If `hasExistingCover` is `"no"` or `"unsure"`, both plans are always forced in regardless of `existingPolicyTypes`.

---

## 5. New Question: Existing Policy Type

**Step number:** Inserted as step 9. Current step 9 (health conditions) shifts to step 10.

**Condition:** Rendered only when `hasExistingCover === "yes"`. Skipped entirely otherwise — the questionnaire flow jumps directly to health conditions.

**Question:** *"Which type(s) of insurance do you already have?"*
**Subtext:** *"We'll avoid recommending what you already have covered."*
**Type:** multi-select

| Value | Label | Emoji |
|---|---|---|
| `term` | Term Life Insurance | 🛡️ |
| `health` | Health / Medical Insurance | 🏥 |
| `ulip` | ULIP / Market-linked Plan | 📈 |
| `savings` | Savings / Endowment Plan | 💰 |
| `pension` | Pension / Annuity Plan | 🏦 |

**New field on `UserProfile`:**
```ts
existingPolicyTypes?: string[]
```
Optional — only populated when `hasExistingCover === "yes"`. Defaults to `[]` otherwise.

---

## 6. Files Changed

| File | Change |
|---|---|
| `lib/recommendations.ts` | Add `bucket` to `Plan` interface + all plan objects; add `existingPolicyTypes?` to `UserProfile`; add `getAllocation()` function; update `getRecommendations()` with forced term/health logic |
| `lib/questions.ts` | Add new conditional question at step 9; renumber health conditions to step 10 |
| `components/Results.tsx` | Add allocation bar component above goal filters; add bucket pill to PlanCard |

No new files needed. All changes are additive to existing files.

**Dynamic step count:** The total number of steps is 9 when `hasExistingCover !== "yes"` and 10 when the policy type question is shown. The progress bar/step indicator in the questionnaire must derive total steps dynamically from the filtered question list, not a hardcoded constant.
