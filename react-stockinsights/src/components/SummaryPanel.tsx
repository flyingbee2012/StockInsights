import React from "react";
import { SummaryData } from "../types";
import { StockAnalyser } from "../services/StockAnalyser";

interface SummaryPanelProps {
  index: number;
  isSelected: boolean;
  summaryData?: SummaryData;
  onSelect: () => void;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({
  index,
  isSelected,
  summaryData,
  onSelect,
}) => {
  const renderSummaryContent = () => {
    if (!summaryData) {
      return <div>Click to view analysis results</div>;
    }

    const { stockInfo, startYear, endYear, analysisResult } = summaryData;
    const { maxDrop, longestDrop } = analysisResult;

    return (
      <div>
        <div
          style={{
            textAlign: "center",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          --- <strong>{stockInfo}</strong> ({startYear} - {endYear}) ---
        </div>

        <div className="separator">Max Drop</div>
        <div>Duration: {maxDrop.duration} days</div>
        <div>
          {StockAnalyser.getDropPct(maxDrop.fromPrice, maxDrop.endPrice)}:{" "}
          {StockAnalyser.formatCurrency(maxDrop.fromPrice)} ({maxDrop.fromDate})
          =&gt; {StockAnalyser.formatCurrency(maxDrop.endPrice)} (
          {maxDrop.endDate})
        </div>

        <br />

        <div className="separator">Longest Drop</div>
        {longestDrop.duration > 0 ? (
          <div>
            <div>Duration: {longestDrop.duration} days</div>
            <div>
              From: {StockAnalyser.formatCurrency(longestDrop.startPrice)} (
              {longestDrop.startDate})
            </div>
            <div>
              Drop:{" "}
              {StockAnalyser.getDropPct(
                longestDrop.startPrice,
                longestDrop.endPrice,
              )}{" "}
              to {StockAnalyser.formatCurrency(longestDrop.endPrice)}
            </div>
            <div>
              Recovery: {longestDrop.recoveryDate || "Never recovered"}
              {!longestDrop.recoveryDate && " (ongoing decline)"}
            </div>
          </div>
        ) : (
          <div>No significant drops found in this period.</div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`summary-panel ${isSelected ? "selected" : ""}`}
      onClick={onSelect}
    >
      {renderSummaryContent()}
    </div>
  );
};

export default SummaryPanel;
