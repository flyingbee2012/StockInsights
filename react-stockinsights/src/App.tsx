import React, { useState, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Price, SummaryData, AnalysisRequest } from "./types";
import { StockAnalyser } from "./services/StockAnalyser";
import { ApiService } from "./services/ApiService";
import StockChart from "./components/StockChart";
import ControlPanel from "./components/ControlPanel";
import SummaryPanel from "./components/SummaryPanel";
import AddStockModal from "./components/AddStockModal";
import styles from "./App.module.scss";

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stockSymbols, setStockSymbols] = useState<string[]>([]);
  const [allSymbols, setAllSymbols] = useState<string[]>([]);
  const [stockCache, setStockCache] = useState<Record<string, Price[]>>({});
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [fund, setFund] = useState<number>(30000);
  const [compound, setCompound] = useState<boolean>(true);
  const [startYear, setStartYear] = useState<number>(2024);
  const [endYear, setEndYear] = useState<number>(2026);
  const [dataMinYear, setDataMinYear] = useState<number>(2024);
  const [dataMaxYear, setDataMaxYear] = useState<number>(2026);
  const [stockData, setStockData] = useState<Price[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<number>(0);
  const [summaryData, setSummaryData] = useState<Record<number, SummaryData>>(
    {},
  );
  const [showModal, setShowModal] = useState<boolean>(false);

  const stockAnalyser = new StockAnalyser();

  useEffect(() => {
    const initialize = async () => {
      try {
        const [defaultSymbols, allSymbolsList] = await Promise.all([
          ApiService.getDefaultSymbolList(),
          ApiService.getAllSymbols(),
        ]);
        setStockSymbols(defaultSymbols);
        setAllSymbols(allSymbolsList);
        setLoading(false);
      } catch (error) {
        console.error("Failed to initialize:", error);
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const loadStockData = useCallback(
    async (
      symbol: string,
      preserveYears?: { startYear: number; endYear: number },
    ) => {
      if (!symbol) return;

      try {
        let prices: Price[];
        if (stockCache[symbol]) {
          prices = stockCache[symbol];
        } else {
          prices = await ApiService.getStockData(symbol);
          setStockCache((prev) => ({ ...prev, [symbol]: prices }));
        }

        setStockData(prices);

        if (prices.length > 0) {
          const dataStartYear = Number(prices[0].dateTime.split("/")[2]);
          const dataEndYear = Number(
            prices[prices.length - 1].dateTime.split("/")[2],
          );
          setDataMinYear(dataStartYear);
          setDataMaxYear(dataEndYear);

          // Only update selected years if not preserving specific years
          if (!preserveYears) {
            setStartYear(dataStartYear);
            setEndYear(dataEndYear);
          } else {
            setStartYear(preserveYears.startYear);
            setEndYear(preserveYears.endYear);
          }
        }
      } catch (error) {
        console.error("Failed to load stock data:", error);
      }
    },
    [stockCache],
  );

  const handleStockChange = (symbol: string) => {
    setSelectedStock(symbol);
    loadStockData(symbol);
  };

  const handleSummarySelect = (index: number) => {
    setSelectedSummary(index);

    const summary = summaryData[index];
    if (summary) {
      // Update the selected stock and load data with preserved time range
      setSelectedStock(summary.stockInfo);
      loadStockData(summary.stockInfo, {
        startYear: summary.startYear,
        endYear: summary.endYear,
      });
    }
  };

  const handleAddStock = async (
    symbol: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const upperSymbol = symbol.toUpperCase();

    // Pre-validation
    if (stockSymbols.includes(upperSymbol)) {
      return {
        success: false,
        error: `${upperSymbol} is already in your stock list.`,
      };
    }

    if (!allSymbols.includes(upperSymbol)) {
      return {
        success: false,
        error: `${upperSymbol} is not a valid stock symbol.`,
      };
    }

    try {
      const result = await ApiService.addStock(upperSymbol);
      if (result.success) {
        setStockSymbols((prev) => [...prev, upperSymbol]);
      }
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  };

  const handleRemoveStock = async () => {
    if (!selectedStock) return;

    try {
      const success = await ApiService.removeStock(selectedStock);
      if (success) {
        setStockSymbols((prev) => prev.filter((s) => s !== selectedStock));
        setSelectedStock("");
        setStockData([]);
        // Clear cache for removed stock
        setStockCache((prev) => {
          const newCache = { ...prev };
          delete newCache[selectedStock];
          return newCache;
        });
      }
    } catch (error) {
      console.error("Failed to remove stock:", error);
    }
  };

  const handleAnalyze = () => {
    if (!selectedStock || !fund || stockData.length === 0) return;

    const analysisResult = stockAnalyser.analyzeStock(
      stockData,
      startYear,
      endYear,
    );

    const summary: SummaryData = {
      stockInfo: selectedStock,
      startYear,
      endYear,
      fund,
      selectedStock,
      analysisResult,
    };

    setSummaryData((prev) => ({ ...prev, [selectedSummary]: summary }));
  };

  const handleReset = () => {
    setSummaryData({});
    setSelectedSummary(0);
  };

  const isAnalyzeEnabled = !!(selectedStock && fund && stockData.length > 0);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ 
          height: "100vh", 
          backgroundColor: "#1a1a1a", 
          color: "#ffffff" 
        }}
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.containerFluid}>
      <div className="row">
        <div className="col-12">
          <div className={styles.summaryContainer}>
            {[0, 1, 2, 3].map((index) => (
              <SummaryPanel
                key={index}
                index={index}
                isSelected={selectedSummary === index}
                summaryData={summaryData[index]}
                onSelect={() => handleSummarySelect(index)}
              />
            ))}
          </div>

          <StockChart
            stockData={stockData}
            stockSymbol={selectedStock}
            startYear={startYear}
            endYear={endYear}
          />

          <ControlPanel
            fund={fund}
            onFundChange={setFund}
            compound={compound}
            onCompoundChange={setCompound}
            selectedStock={selectedStock}
            stockSymbols={stockSymbols}
            onStockChange={handleStockChange}
            onAddStock={() => setShowModal(true)}
            onRemoveStock={handleRemoveStock}
            startYear={startYear}
            endYear={endYear}
            dataMinYear={dataMinYear}
            dataMaxYear={dataMaxYear}
            onYearRangeChange={(start, end) => {
              setStartYear(start);
              setEndYear(end);
            }}
            onReset={handleReset}
            onAnalyze={handleAnalyze}
            isAnalyzeEnabled={isAnalyzeEnabled}
          />
        </div>
      </div>

      <AddStockModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onAddStock={handleAddStock}
        availableSymbols={allSymbols}
      />
    </div>
  );
};

export default App;
