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
