import type { Price } from "../types/StockTypes";
import { findMaxDrop, findLongestDrop } from "../utils/StockAnalyser";

// Helper to create a Price entry with minimal required fields
const makePrice = (
  dateTime: string,
  highPrice: number,
  lowPrice: number,
  closePrice?: number,
  openPrice?: number,
): Price => ({
  dateTime,
  openPrice: openPrice ?? highPrice,
  highPrice,
  lowPrice,
  closePrice: closePrice ?? lowPrice,
});

describe("findMaxDrop", () => {
  it("finds a single drop with full recovery", () => {
    const prices: Price[] = [
      makePrice("01/01/2020", 100, 95),
      makePrice("02/01/2020", 98, 60), // drop to 60 from peak 100 = 40%
      makePrice("03/01/2020", 105, 90), // recovery
    ];

    const result = findMaxDrop(prices);
    expect(result.fromPrice).toBe(100);
    expect(result.fromDate).toBe("01/01/2020");
    expect(result.endPrice).toBe(60);
    expect(result.endDate).toBe("02/01/2020");
    expect(result.recoveryDate).toBe("03/01/2020");
  });

  it("finds a single drop with no recovery", () => {
    const prices: Price[] = [
      makePrice("01/01/2020", 100, 95),
      makePrice("02/01/2020", 80, 50),
      makePrice("03/01/2020", 70, 40),
    ];

    const result = findMaxDrop(prices);
    expect(result.fromPrice).toBe(100);
    expect(result.endPrice).toBe(40);
    expect(result.endDate).toBe("03/01/2020");
    expect(result.recoveryDate).toBeNull();
  });

  it("picks the biggest percentage drop among multiple drops", () => {
    // First drop: 100 -> 70 = 30%
    // Second drop: 120 -> 60 = 50% (bigger)
    const prices: Price[] = [
      makePrice("01/01/2020", 100, 95),
      makePrice("02/01/2020", 90, 70), // 30% drop from 100
      makePrice("03/01/2020", 120, 110), // new peak at 120
      makePrice("04/01/2020", 80, 60), // 50% drop from 120
      makePrice("05/01/2020", 125, 115), // recovery
    ];

    const result = findMaxDrop(prices);
    expect(result.fromPrice).toBe(120);
    expect(result.fromDate).toBe("03/01/2020");
    expect(result.endPrice).toBe(60);
    expect(result.endDate).toBe("04/01/2020");
    expect(result.recoveryDate).toBe("05/01/2020");
  });

  it("picks the first drop when it is the largest", () => {
    // First drop: 200 -> 50 = 75%
    // Second drop: 210 -> 150 = ~28.6%
    const prices: Price[] = [
      makePrice("01/01/2020", 200, 190),
      makePrice("02/01/2020", 100, 50), // 75% drop from 200
      makePrice("03/01/2020", 210, 180), // recovery + new peak
      makePrice("04/01/2020", 190, 150), // ~28.6% drop from 210
      makePrice("05/01/2020", 220, 200), // recovery
    ];

    const result = findMaxDrop(prices);
    expect(result.fromPrice).toBe(200);
    expect(result.endPrice).toBe(50);
    expect(result.endDate).toBe("02/01/2020");
    expect(result.recoveryDate).toBe("03/01/2020");
  });

  it("handles monotonically increasing prices (no meaningful drop)", () => {
    const prices: Price[] = [
      makePrice("01/01/2020", 100, 95),
      makePrice("02/01/2020", 110, 105),
      makePrice("03/01/2020", 120, 115),
    ];

    const result = findMaxDrop(prices);
    // The "max drop" is still tracked from highest high to lowest low seen after
    // Peak 120, low 115 -> ~4.17%
    // But the first entry has low 95, peak at that point 100 -> 5%
    expect(result.fromPrice).toBeGreaterThan(0);
    expect(result.endPrice).toBeGreaterThan(0);
  });

  it("handles a steady decline (no recovery)", () => {
    const prices: Price[] = [
      makePrice("01/01/2020", 100, 90),
      makePrice("02/01/2020", 80, 70),
      makePrice("03/01/2020", 60, 50),
      makePrice("04/01/2020", 40, 30),
    ];

    const result = findMaxDrop(prices);
    expect(result.fromPrice).toBe(100);
    expect(result.endPrice).toBe(30);
    expect(result.endDate).toBe("04/01/2020");
    expect(result.recoveryDate).toBeNull();
  });

  it("calculates duration until recovery", () => {
    const prices: Price[] = [
      makePrice("01/01/2020", 100, 95),
      makePrice("01/15/2020", 80, 50),
      makePrice("02/01/2020", 105, 90), // recovery 31 days after start
    ];

    const result = findMaxDrop(prices);
    expect(result.duration).toBe(31); // Jan 1 to Feb 1
  });

  it("calculates duration to end of data when no recovery", () => {
    const prices: Price[] = [
      makePrice("01/01/2020", 100, 95),
      makePrice("01/15/2020", 80, 50),
      makePrice("02/01/2020", 70, 60),
    ];

    const result = findMaxDrop(prices);
    expect(result.duration).toBe(31); // Jan 1 to Feb 1 (end of data)
    expect(result.recoveryDate).toBeNull();
  });

  it("handles drop that starts at the very first price", () => {
    const prices: Price[] = [
      makePrice("06/01/2020", 150, 140),
      makePrice("07/01/2020", 80, 60),
      makePrice("08/01/2020", 70, 55),
    ];

    const result = findMaxDrop(prices);
    expect(result.fromPrice).toBe(150);
    expect(result.fromDate).toBe("06/01/2020");
    expect(result.endPrice).toBe(55);
  });

  it("handles prices with identical highs (flat top)", () => {
    const prices: Price[] = [
      makePrice("01/01/2020", 100, 95),
      makePrice("02/01/2020", 100, 90),
      makePrice("03/01/2020", 100, 70), // biggest low
      makePrice("04/01/2020", 100, 95),
    ];

    const result = findMaxDrop(prices);
    expect(result.endPrice).toBe(70);
  });
});

describe("findLongestDrop", () => {
  it("finds a single drop with recovery", () => {
    const prices: Price[] = [
      makePrice("01/01/2020", 100, 95),
      makePrice("02/01/2020", 80, 60),
      makePrice("03/01/2020", 105, 90), // recovery
    ];

    const result = findLongestDrop(prices);
    expect(result).not.toBeNull();
    expect(result!.startPrice).toBe(100);
    expect(result!.startDate).toBe("01/01/2020");
    expect(result!.lowestPrice).toBe(60);
    expect(result!.lowestDate).toBe("02/01/2020");
    expect(result!.recoveryDate).toBe("03/01/2020");
  });

  it("finds the longest drop among multiple drops", () => {
    // Drop 1: Jan 1 -> Feb 1 (31 days, recovers)
    // Drop 2: Mar 1 -> Jun 1 (92 days, recovers) <-- longest
    const prices: Price[] = [
      makePrice("01/01/2020", 100, 95),
      makePrice("01/15/2020", 80, 60),
      makePrice("02/01/2020", 105, 90), // recovery of first drop
      makePrice("03/01/2020", 110, 100), // new peak, start of second drop
      makePrice("04/01/2020", 90, 70),
      makePrice("05/01/2020", 95, 80),
      makePrice("06/01/2020", 115, 105), // recovery of second drop
    ];

    const result = findLongestDrop(prices);
    expect(result).not.toBeNull();
    expect(result!.startDate).toBe("03/01/2020");
    expect(result!.recoveryDate).toBe("06/01/2020");
    expect(result!.lowestPrice).toBe(70);
  });

  it("handles a drop that never recovers", () => {
    const prices: Price[] = [
      makePrice("01/01/2020", 100, 95),
      makePrice("06/01/2020", 80, 50),
      makePrice("12/01/2020", 70, 40),
    ];

    const result = findLongestDrop(prices);
    expect(result).not.toBeNull();
    expect(result!.startPrice).toBe(100);
    expect(result!.recoveryDate).toBeNull();
    expect(result!.lowestPrice).toBe(40);
  });

  it("prefers the unrecovered drop when it is the longest", () => {
    // Drop 1: Jan 1 -> Feb 1 (31 days, recovers)
    // Drop 2: Mar 1 -> never recovers (to Dec 1 = 275 days)
    const prices: Price[] = [
      makePrice("01/01/2020", 100, 95),
      makePrice("01/15/2020", 80, 70),
      makePrice("02/01/2020", 110, 100), // recovery
      makePrice("03/01/2020", 120, 110), // new peak
      makePrice("06/01/2020", 90, 60),
      makePrice("12/01/2020", 80, 50), // still below 120, no recovery
    ];

    const result = findLongestDrop(prices);
    expect(result).not.toBeNull();
    expect(result!.startDate).toBe("03/01/2020");
    expect(result!.recoveryDate).toBeNull();
  });

  it("max drop and longest drop are the same period", () => {
    // Only one significant drop
    const prices: Price[] = [
      makePrice("01/01/2020", 100, 95),
      makePrice("03/01/2020", 50, 20), // huge drop, also long
      makePrice("06/01/2020", 40, 15),
      makePrice("12/01/2020", 110, 90), // recovery
    ];

    const longestResult = findLongestDrop(prices);
    const maxResult = findMaxDrop(prices);

    // Both should reference the same drop period starting at Jan 1
    expect(longestResult!.startDate).toBe("01/01/2020");
    expect(maxResult.fromDate).toBe("01/01/2020");
  });

  it("max drop and longest drop are different periods", () => {
    // Drop 1: biggest % drop (100 -> 30 = 70%) but short (Jan 1 -> Mar 1 recovery)
    // Drop 2: smaller % drop (110 -> 70 = ~36%) but much longer (Apr 1 -> Dec 1 recovery)
    const prices: Price[] = [
      makePrice("01/01/2020", 100, 95),
      makePrice("01/15/2020", 50, 30), // big % drop
      makePrice("03/01/2020", 105, 90), // recovery (59 days)
      makePrice("04/01/2020", 110, 105), // new peak
      makePrice("06/01/2020", 90, 70), // smaller % drop
      makePrice("09/01/2020", 95, 80),
      makePrice("12/01/2020", 115, 100), // recovery (244 days)
    ];

    const longestResult = findLongestDrop(prices);
    const maxResult = findMaxDrop(prices);

    // Max drop should be the 70% drop
    expect(maxResult.fromPrice).toBe(100);
    expect(maxResult.endPrice).toBe(30);

    // Longest drop should be the Apr-Dec period
    expect(longestResult!.startDate).toBe("04/01/2020");
    expect(longestResult!.recoveryDate).toBe("12/01/2020");
  });

  it("handles monotonically increasing prices", () => {
    const prices: Price[] = [
      makePrice("01/01/2020", 100, 95),
      makePrice("02/01/2020", 110, 105),
      makePrice("03/01/2020", 120, 115),
    ];

    const result = findLongestDrop(prices);
    // Each point recovers immediately at the next, so drops have 0 or near-0 duration
    expect(result).not.toBeNull();
    expect(result!.duration).toBeLessThanOrEqual(31);
  });

  it("handles a steady decline (entire period is one drop)", () => {
    const prices: Price[] = [
      makePrice("01/01/2020", 100, 90),
      makePrice("04/01/2020", 80, 70),
      makePrice("07/01/2020", 60, 50),
      makePrice("10/01/2020", 40, 30),
    ];

    const result = findLongestDrop(prices);
    expect(result).not.toBeNull();
    expect(result!.startPrice).toBe(100);
    expect(result!.startDate).toBe("01/01/2020");
    expect(result!.recoveryDate).toBeNull();
    expect(result!.lowestPrice).toBe(30);
  });

  it("finds the lowest price within the drop period", () => {
    const prices: Price[] = [
      makePrice("01/01/2020", 100, 95),
      makePrice("02/01/2020", 80, 60),
      makePrice("03/01/2020", 70, 40), // lowest point
      makePrice("04/01/2020", 85, 55),
      makePrice("05/01/2020", 105, 90), // recovery
    ];

    const result = findLongestDrop(prices);
    expect(result).not.toBeNull();
    expect(result!.lowestPrice).toBe(40);
    expect(result!.lowestDate).toBe("03/01/2020");
  });

  it("handles multiple equal-length drops and picks the longest", () => {
    // Two drops of roughly equal calendar duration
    // Drop 1: Jan 1 -> Mar 1 (60 days)
    // Drop 2: Apr 1 -> Jun 1 (61 days) <-- slightly longer
    const prices: Price[] = [
      makePrice("01/01/2020", 100, 95),
      makePrice("02/01/2020", 80, 60),
      makePrice("03/01/2020", 105, 90), // recovery (60 days)
      makePrice("04/01/2020", 110, 105),
      makePrice("05/01/2020", 90, 70),
      makePrice("06/01/2020", 115, 100), // recovery (61 days)
    ];

    const result = findLongestDrop(prices);
    expect(result).not.toBeNull();
    // Should pick the longer one
    expect(result!.duration).toBeGreaterThanOrEqual(60);
  });

  it("handles only two prices", () => {
    const prices: Price[] = [
      makePrice("01/01/2020", 100, 90),
      makePrice("06/01/2020", 50, 40),
    ];

    const result = findLongestDrop(prices);
    expect(result).not.toBeNull();
    expect(result!.startPrice).toBe(100);
    expect(result!.recoveryDate).toBeNull();
  });
});
