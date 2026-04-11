import {
  Price,
  MaxDropData,
  LongestDropData,
  DropAnalysisResult,
} from "../types";

export class StockAnalyser {
  private prices: Price[] = [];

  // Max Drop tracking
  private biggestDropFromPrice: number = 0.0;
  private biggestDropFromPriceDate: string | null = null;
  private biggestDropEndPrice: number = 0.0;
  private biggestDropEndPriceDate: string | null = null;
  private biggestDropDuration: number = 0;

  // Longest Drop tracking
  private longestDropDuration: number = 0;
  private longestDropStartPrice: number = 0.0;
  private longestDropStartDate: string | null = null;
  private longestDropEndPrice: number = 0.0;
  private longestDropEndDate: string | null = null;
  private longestDropRecoveryDate: string | null = null;

  constructor() {}

  private getYear(dateTimeString: string): number {
    return Number(dateTimeString.split("/")[2]);
  }

  // Calculate calendar days between two dates (M/D/YYYY format)
  private calculateDateDifference(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDifference = end.getTime() - start.getTime();
    const dayDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return dayDifference;
  }

  public analyzeStock(
    prices: Price[],
    startYear: number,
    endYear: number,
  ): DropAnalysisResult {
    // Process all prices to find the data range first
    const validPrices: Price[] = [];
    for (let i = 0; i < prices.length; i++) {
      const dt = this.getYear(prices[i].dateTime);
      if (dt >= startYear && dt <= endYear) {
        validPrices.push({ ...prices[i], originalIndex: i });
      }
    }
    this.prices = validPrices;

    // Calculate Max Drop
    this.findMaxDrop();

    // Calculate Longest Drop
    this.findLongestDrop();

    return {
      maxDrop: {
        fromPrice: this.biggestDropFromPrice,
        fromDate: this.biggestDropFromPriceDate || "",
        endPrice: this.biggestDropEndPrice,
        endDate: this.biggestDropEndPriceDate || "",
        duration: this.biggestDropDuration,
      },
      longestDrop: {
        duration: this.longestDropDuration,
        startPrice: this.longestDropStartPrice,
        startDate: this.longestDropStartDate || "",
        endPrice: this.longestDropEndPrice,
        endDate: this.longestDropEndDate || "",
        recoveryDate: this.longestDropRecoveryDate,
      },
    };
  }

  private findMaxDrop(): void {
    let maxDrop = Number.MIN_SAFE_INTEGER;
    let highestPrice = Number.MIN_SAFE_INTEGER;
    let highestPriceDate: string | null = null;

    for (let i = 0; i < this.prices.length; i++) {
      const currentPrice = this.prices[i];

      if (currentPrice.highPrice > highestPrice) {
        highestPrice = currentPrice.highPrice;
        highestPriceDate = currentPrice.dateTime;
      }

      const dropPct =
        ((highestPrice - currentPrice.lowPrice) / highestPrice) * 100;
      if (dropPct > maxDrop) {
        maxDrop = dropPct;
        this.biggestDropFromPrice = highestPrice;
        this.biggestDropFromPriceDate = highestPriceDate;
        this.biggestDropEndPrice = currentPrice.lowPrice;
        this.biggestDropEndPriceDate = currentPrice.dateTime;
        this.biggestDropDuration = this.calculateDateDifference(
          highestPriceDate!,
          currentPrice.dateTime,
        );
      }
    }
  }

  private findLongestDrop(): void {
    const dropDurations: Array<{
      duration: number;
      startPrice: number;
      startDate: string;
      lowestPrice: number;
      lowestDate: string;
      recoveryDate: string | null;
    }> = [];

    let i = 0;

    while (i < this.prices.length - 1) {
      const currentHigh = this.prices[i].highPrice;
      const currentDate = this.prices[i].dateTime;

      const dropStartIndex = i;
      const dropStartPrice = currentHigh;
      const dropStartDate = currentDate;
      let recoveryIndex = -1;

      // Look forward for recovery (highPrice >= original highPrice)
      for (let j = i + 1; j < this.prices.length; j++) {
        if (this.prices[j].highPrice >= currentHigh) {
          recoveryIndex = j;
          break;
        }
      }

      let dropDuration: number;
      let recoveryDate: string | null;
      let lowestPrice = currentHigh;
      let lowestDate = currentDate;

      // Find the lowest price during the drop period
      const endIndex =
        recoveryIndex !== -1 ? recoveryIndex : this.prices.length - 1;
      for (let k = dropStartIndex; k <= endIndex; k++) {
        if (this.prices[k].lowPrice < lowestPrice) {
          lowestPrice = this.prices[k].lowPrice;
          lowestDate = this.prices[k].dateTime;
        }
      }

      if (recoveryIndex !== -1) {
        // Recovered - calculate calendar days between start and recovery
        dropDuration = this.calculateDateDifference(
          dropStartDate,
          this.prices[recoveryIndex].dateTime,
        );
        recoveryDate = this.prices[recoveryIndex].dateTime;
        i = recoveryIndex; // Jump to recovery point
      } else {
        // Never recovered - calculate calendar days from start to end of data
        const endDate = this.prices[this.prices.length - 1].dateTime;
        dropDuration = this.calculateDateDifference(dropStartDate, endDate);
        recoveryDate = null;
        i = this.prices.length; // End the loop
      }

      dropDurations.push({
        duration: dropDuration,
        startPrice: dropStartPrice,
        startDate: dropStartDate,
        lowestPrice: lowestPrice,
        lowestDate: lowestDate,
        recoveryDate: recoveryDate,
      });
    }

    // Find the longest drop
    let longestDrop: (typeof dropDurations)[0] | null = null;
    for (let d = 0; d < dropDurations.length; d++) {
      if (!longestDrop || dropDurations[d].duration > longestDrop.duration) {
        longestDrop = dropDurations[d];
      }
    }

    // Set longest drop properties
    if (longestDrop) {
      this.longestDropDuration = longestDrop.duration;
      this.longestDropStartPrice = longestDrop.startPrice;
      this.longestDropStartDate = longestDrop.startDate;
      this.longestDropEndPrice = longestDrop.lowestPrice;
      this.longestDropEndDate = longestDrop.lowestDate;
      this.longestDropRecoveryDate = longestDrop.recoveryDate;
    }
  }

  public static getDropPct(fromPrice: number, endPrice: number): string {
    const n = ((fromPrice - endPrice) / fromPrice) * 100;
    return n.toFixed(3) + "%";
  }

  public static formatCurrency(value: number): string {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    });
  }
}
