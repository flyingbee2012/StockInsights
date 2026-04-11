import { Price } from "../types";

const HOSTNAME = "localhost:3000";

export class ApiService {
  static async getDefaultSymbolList(): Promise<string[]> {
    const response = await fetch(`http://${HOSTNAME}/getdefaultlist`);
    if (!response.ok) {
      throw new Error("Failed to fetch symbol list");
    }
    return response.json();
  }

  static async getAllSymbols(): Promise<string[]> {
    const response = await fetch(`http://${HOSTNAME}/getsymbols`);
    if (!response.ok) {
      throw new Error("Failed to fetch all symbols");
    }
    return response.json();
  }

  static async getStockData(symbol: string): Promise<Price[]> {
    const response = await fetch(`http://${HOSTNAME}/${symbol}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for ${symbol}`);
    }
    const rawData = await response.text();
    return this.convertRawDataToList(rawData);
  }

  static async addStock(
    symbol: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `http://${HOSTNAME}/addstock?symbol=${symbol}`,
        {
          method: "PUT",
        },
      );

      if (!response.ok) {
        return { success: false, error: `Server error: ${response.status}` };
      }

      const result = await response.text();

      if (result === "success") {
        return { success: true };
      } else {
        // Backend returns "failure" for two cases:
        // 1. Symbol already exists in default list
        // 2. Symbol not found in available symbols
        return {
          success: false,
          error: `Unable to add ${symbol}. Stock may already be added or symbol may not be available.`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  static async removeStock(symbol: string): Promise<boolean> {
    const response = await fetch(
      `http://${HOSTNAME}/deletestock?symbol=${symbol}`,
      {
        method: "PUT",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to remove stock");
    }
    const result = await response.text();
    return result === "success";
  }

  private static convertRawDataToList(data: string): Price[] {
    const parsedData = JSON.parse(data);
    const headerLength = Object.keys(JSON.parse(parsedData[0])).length;
    const prices: Price[] = [];

    for (let i = 1; i < parsedData.length; i++) {
      const priceObject = JSON.parse(parsedData[i]);
      if (Object.keys(priceObject).length === headerLength) {
        const dt = priceObject.Date;
        const openPrice = Number(priceObject.Open);
        const highPrice = Number(priceObject.High);
        const lowPrice = Number(priceObject.Low);
        const closePrice = Number(priceObject.Close);

        prices.push({
          dateTime: dt,
          openPrice,
          highPrice,
          lowPrice,
          closePrice,
        });
      }
    }
    return prices;
  }
}
