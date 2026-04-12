export interface Price {
  dateTime: string;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  originalIndex?: number;
}

export interface MaxDropData {
  fromPrice: number;
  fromDate: string;
  endPrice: number;
  endDate: string;
  duration: number;
}

export interface LongestDropData {
  duration: number;
  startPrice: number;
  startDate: string;
  endPrice: number;
  endDate: string;
  recoveryDate: string | null;
}

export interface DropAnalysisResult {
  maxDrop: MaxDropData;
  longestDrop: LongestDropData;
}

export interface StockData {
  symbol: string;
  prices: Price[];
}

export interface AnalysisRequest {
  fund: number;
  selectedStock: string;
  startYear: number;
  endYear: number;
}

export interface ProfitLossData {
  startPrice: number;
  startDate: string;
  endPrice: number;
  endDate: string;
  profitLoss: number;
  profitLossPct: number;
}

export interface SummaryData {
  stockInfo: string;
  startYear: number;
  endYear: number;
  fund: number;
  selectedStock: string;
  analysisResult: DropAnalysisResult;
  profitLoss: ProfitLossData;
}

export interface ChartDataPoint {
  x: string;
  y: number;
}

export interface StockChartData {
  name: string;
  data: ChartDataPoint[];
}
