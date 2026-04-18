import { describe, it, expect } from "vitest";
import { getAllocation, PLANS, getRecommendations, UserProfile } from "@/lib/recommendations";

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

  it("excludes sampoorna-raksha force when user has term", () => {
    const profile: UserProfile = {
      ...BASE_PROFILE,
      hasExistingCover: "yes",
      existingPolicyTypes: ["term"],
    };
    const { primary } = getRecommendations(profile);
    expect(primary.map(p => p.id)).not.toContain("sampoorna-raksha");
  });

  it("excludes shubh-health-pro force when user has health insurance", () => {
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
