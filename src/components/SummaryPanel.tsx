import React from "react";
import { SummaryData } from "../types";
import { getDropPct, formatCurrency } from "../utils/StockAnalyser";
import styles from "./SummaryPanel.module.scss";

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
        <div className={styles.stockTitle}>
          --- <strong>{stockInfo}</strong> ({startYear} - {endYear}) ---
        </div>

        <div className={styles.separator}>Max Drop</div>
        <div>Duration: {maxDrop.duration} days</div>
        <div>
          {getDropPct(maxDrop.fromPrice, maxDrop.endPrice)}:{" "}
          {formatCurrency(maxDrop.fromPrice)} ({maxDrop.fromDate}) =&gt;{" "}
          {formatCurrency(maxDrop.endPrice)} ({maxDrop.endDate})
        </div>

        <div className={styles.separator}>Longest Drop</div>
        {longestDrop.duration > 0 ? (
          <div>
            <div>Duration: {longestDrop.duration} days</div>
            <div>
              From: {formatCurrency(longestDrop.startPrice)} (
              {longestDrop.startDate})
            </div>
            <div>
              Drop: {getDropPct(longestDrop.startPrice, longestDrop.endPrice)}{" "}
              to {formatCurrency(longestDrop.endPrice)}
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
      className={`${styles.summaryPanel} ${isSelected ? styles.selected : ""}`}
      onClick={onSelect}
    >
      {renderSummaryContent()}
    </div>
  );
};

export default SummaryPanel;
