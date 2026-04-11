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

  /**
   * Converts raw API data to Price array format
   *
   * Expected Raw Data Format:
   * [
   *   "{\"Date\":\"12/2/2022\",\"Open\":20,\"High\":20.38,\"Low\":20,\"Close\":20.20,\"Volume\":1383500}",
   *   "{\"Date\":\"12/5/2022\",\"Open\":20.07,\"High\":20.10,\"Low\":19.90,\"Close\":19.93,\"Volume\":17900}",
   *   ...
   * ]
   *
   * @param data Raw JSON string from API containing array of stringified JSON objects
   * @returns Array of Price objects with parsed date/price data
   *
   * CRITICAL: This parser expects:
   * - Array of JSON strings (each element is stringified JSON)
   * - All elements contain actual price data (no header element)
   * - All elements should have same field count for data integrity
   * - Required fields: Date, Open, High, Low, Close, Volume
   * - Date in MM/dd/yyyy format, numbers for all price fields
   */
  private static convertRawDataToList(data: string): Price[] {
    const parsedData = JSON.parse(data);

    // Use first element to determine expected field count for validation
    const headerLength = Object.keys(JSON.parse(parsedData[0])).length;
    const prices: Price[] = [];

    // Process all elements starting from index 0 (all are data, no header)
    for (let i = 0; i < parsedData.length; i++) {
      const priceObject = JSON.parse(parsedData[i]);

      // Validate object has same field count as first element (data integrity check)
      if (Object.keys(priceObject).length === headerLength) {
        const dt = priceObject.Date; // MM/dd/yyyy format
        const openPrice = Number(priceObject.Open); // Convert to number
        const highPrice = Number(priceObject.High); // Convert to number
        const lowPrice = Number(priceObject.Low); // Convert to number
        const closePrice = Number(priceObject.Close); // Convert to number

        prices.push({
          dateTime: dt,
          openPrice,
          highPrice,
          lowPrice,
          closePrice,
        });
      }
      // Note: Objects with mismatched field counts are silently skipped
    }
    return prices;
  }
}
