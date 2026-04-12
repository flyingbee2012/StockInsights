import type {
  Price,
  DropAnalysisResult,
  ProfitLossData,
} from "../types/StockTypes";

// Types for internal calculations
interface DropPeriod {
  duration: number;
  startPrice: number;
  startDate: string;
  lowestPrice: number;
  lowestDate: string;
  recoveryDate: string | null;
}

interface MaxDropResult {
  fromPrice: number;
  fromDate: string;
  endPrice: number;
  endDate: string;
  duration: number;
  recoveryDate: string | null;
}

// Helper functions
const getYear = (dateTimeString: string): number => {
  return Number(dateTimeString.split("/")[2]);
};

const calculateDateDifference = (
  startDate: string,
  endDate: string,
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDifference = end.getTime() - start.getTime();
  const dayDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
  return dayDifference;
};

const filterPricesByYear = (
  prices: Price[],
  startYear: number,
  endYear: number,
): Price[] => {
  return prices.filter((price) => {
    const year = getYear(price.dateTime);
    return year >= startYear && year <= endYear;
  });
};

const findMaxDrop = (prices: Price[]): MaxDropResult => {
  let maxDrop = Number.MIN_SAFE_INTEGER;
  let highestPrice = Number.MIN_SAFE_INTEGER;
  let highestPriceDate: string | null = null;
  let highestPriceIndex = 0;

  let biggestDropFromPrice = 0;
  let biggestDropFromPriceDate = "";
  let biggestDropFromIndex = 0;
  let biggestDropEndPrice = 0;
  let biggestDropEndPriceDate = "";

  for (let i = 0; i < prices.length; i++) {
    const currentPrice = prices[i];

    if (currentPrice.highPrice > highestPrice) {
      highestPrice = currentPrice.highPrice;
      highestPriceDate = currentPrice.dateTime;
      highestPriceIndex = i;
    }

    const dropPct =
      ((highestPrice - currentPrice.lowPrice) / highestPrice) * 100;
    if (dropPct > maxDrop) {
      maxDrop = dropPct;
      biggestDropFromPrice = highestPrice;
      biggestDropFromPriceDate = highestPriceDate!;
      biggestDropFromIndex = highestPriceIndex;
      biggestDropEndPrice = currentPrice.lowPrice;
      biggestDropEndPriceDate = currentPrice.dateTime;
    }
  }

  // Find recovery point (highPrice >= original peak)
  let recoveryDate: string | null = null;
  let durationEndDate = prices[prices.length - 1]?.dateTime ?? biggestDropEndPriceDate;
  for (let j = biggestDropFromIndex + 1; j < prices.length; j++) {
    if (prices[j].highPrice >= biggestDropFromPrice) {
      recoveryDate = prices[j].dateTime;
      durationEndDate = recoveryDate;
      break;
    }
  }

  const duration = calculateDateDifference(
    biggestDropFromPriceDate,
    durationEndDate,
  );

  return {
    fromPrice: biggestDropFromPrice,
    fromDate: biggestDropFromPriceDate,
    endPrice: biggestDropEndPrice,
    endDate: biggestDropEndPriceDate,
    duration,
    recoveryDate,
  };
};

const findLongestDrop = (prices: Price[]): DropPeriod | null => {
  const dropDurations: DropPeriod[] = [];
  let i = 0;

  while (i < prices.length - 1) {
    const currentHigh = prices[i].highPrice;
    const currentDate = prices[i].dateTime;

    const dropStartIndex = i;
    const dropStartPrice = currentHigh;
    const dropStartDate = currentDate;
    let recoveryIndex = -1;

    // Look forward for recovery (highPrice >= original highPrice)
    for (let j = i + 1; j < prices.length; j++) {
      if (prices[j].highPrice >= currentHigh) {
        recoveryIndex = j;
        break;
      }
    }

    let dropDuration: number;
    let recoveryDate: string | null;
    let lowestPrice = currentHigh;
    let lowestDate = currentDate;

    // Find the lowest price during the drop period
    const endIndex = recoveryIndex !== -1 ? recoveryIndex : prices.length - 1;
    for (let k = dropStartIndex; k <= endIndex; k++) {
      if (prices[k].lowPrice < lowestPrice) {
        lowestPrice = prices[k].lowPrice;
        lowestDate = prices[k].dateTime;
      }
    }

    if (recoveryIndex !== -1) {
      // Recovered - calculate calendar days between start and recovery
      dropDuration = calculateDateDifference(
        dropStartDate,
        prices[recoveryIndex].dateTime,
      );
      recoveryDate = prices[recoveryIndex].dateTime;
      i = recoveryIndex; // Jump to recovery point
    } else {
      // Never recovered - calculate calendar days from start to end of data
      const endDate = prices[prices.length - 1].dateTime;
      dropDuration = calculateDateDifference(dropStartDate, endDate);
      recoveryDate = null;
      i = prices.length; // End the loop
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
  let longestDrop: DropPeriod | null = null;
  for (const drop of dropDurations) {
    if (!longestDrop || drop.duration > longestDrop.duration) {
      longestDrop = drop;
    }
  }

  return longestDrop;
};

// Main analysis function
export const analyzeStock = (
  prices: Price[],
  startYear: number,
  endYear: number,
): DropAnalysisResult => {
  // Filter prices by year range
  const validPrices = filterPricesByYear(prices, startYear, endYear);

  // Calculate Max Drop
  const maxDrop = findMaxDrop(validPrices);

  // Calculate Longest Drop
  const longestDrop = findLongestDrop(validPrices);

  return {
    maxDrop,
    longestDrop: {
      duration: longestDrop?.duration ?? 0,
      startPrice: longestDrop?.startPrice ?? 0,
      startDate: longestDrop?.startDate ?? "",
      endPrice: longestDrop?.lowestPrice ?? 0,
      endDate: longestDrop?.lowestDate ?? "",
      recoveryDate: longestDrop?.recoveryDate ?? null,
    },
  };
};

export const calculateProfitLoss = (
  prices: Price[],
  startYear: number,
  endYear: number,
  fund: number,
): ProfitLossData => {
  const validPrices = filterPricesByYear(prices, startYear, endYear);

  if (validPrices.length < 2) {
    return {
      startPrice: 0,
      startDate: "",
      endPrice: 0,
      endDate: "",
      profitLoss: 0,
      profitLossPct: 0,
    };
  }

  const first = validPrices[0];
  const last = validPrices[validPrices.length - 1];
  const shares = fund / first.closePrice;
  const endValue = shares * last.closePrice;
  const profitLoss = endValue - fund;
  const profitLossPct =
    ((last.closePrice - first.closePrice) / first.closePrice) * 100;

  return {
    startPrice: first.closePrice,
    startDate: first.dateTime,
    endPrice: last.closePrice,
    endDate: last.dateTime,
    profitLoss,
    profitLossPct,
  };
};

// Utility functions
export const getDropPct = (fromPrice: number, endPrice: number): string => {
  const n = ((fromPrice - endPrice) / fromPrice) * 100;
  return n.toFixed(2) + "%";
};

export const formatCurrency = (value: number): string => {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
