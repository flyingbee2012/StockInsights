import React from "react";
import { SummaryData } from "../types/StockTypes";
import { getDropPct, formatCurrency } from "../utils/StockAnalyser";
import styles from "./SummaryPanel.module.scss";

interface SummaryPanelProps {
  isSelected: boolean;
  summaryData?: SummaryData;
  onSelect: () => void;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({
  isSelected,
  summaryData,
  onSelect,
}) => {
  const renderSummaryContent = () => {
    if (!summaryData) {
      return <div>Click to view analysis results</div>;
    }

    const { stockInfo, startYear, endYear, fund, analysisResult, profitLoss } =
      summaryData;
    const { maxDrop, longestDrop } = analysisResult;

    // Recalculate dollar P/L based on fund at analysis time
    const computedPL = fund * (profitLoss.profitLossPct / 100);
    const plClass = computedPL >= 0 ? styles.profit : styles.loss;

    return (
      <div>
        <div className={styles.stockTitle}>
          --- <strong>{stockInfo}</strong> ({startYear} - {endYear}) ---
        </div>

        <div className={styles.separator}>
          Profit / Loss (Fund: {formatCurrency(fund)})
        </div>
        <div>
          {formatCurrency(profitLoss.startPrice)} =&gt;{" "}
          {formatCurrency(profitLoss.endPrice)}
          {" | "}
          <span className={plClass}>
            {computedPL >= 0 ? "+" : ""}
            {formatCurrency(computedPL)} (
            {profitLoss.profitLossPct >= 0 ? "+" : ""}
            {profitLoss.profitLossPct.toFixed(2)}%)
          </span>
        </div>

        <div className={styles.separator}>
          Max Drop ({maxDrop.duration} days
          {maxDrop.recoveryDate ? " to recover" : ", never recovered"})
        </div>
        <div>
          {getDropPct(maxDrop.fromPrice, maxDrop.endPrice)}:{" "}
          {formatCurrency(maxDrop.fromPrice)} ({maxDrop.fromDate}) =&gt;{" "}
          {formatCurrency(maxDrop.endPrice)} ({maxDrop.endDate})
        </div>
        {maxDrop.recoveryDate && (
          <div>Recovery date: {maxDrop.recoveryDate}</div>
        )}

        <div className={styles.separator}>
          Longest Drop ({longestDrop.duration} days
          {longestDrop.recoveryDate ? " to recover" : ", never recovered"})
        </div>
        {longestDrop.duration > 0 ? (
          <div>
            <div>
              {getDropPct(longestDrop.startPrice, longestDrop.endPrice)}:{" "}
              {formatCurrency(longestDrop.startPrice)} ({longestDrop.startDate})
              =&gt; {formatCurrency(longestDrop.endPrice)} (
              {longestDrop.endDate})
            </div>
            {longestDrop.recoveryDate && (
              <div>Recovery date: {longestDrop.recoveryDate}</div>
            )}
          </div>
        ) : (
          <div>No significant drops found.</div>
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
