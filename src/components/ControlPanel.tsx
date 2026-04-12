import React from "react";
import styles from "./ControlPanel.module.scss";
import DualRangeSlider from "./DualRangeSlider";

interface ControlPanelProps {
  fund: number;
  onFundChange: (fund: number) => void;
  compound: boolean;
  onCompoundChange: (compound: boolean) => void;
  selectedStock: string;
  stockSymbols: string[];
  onStockChange: (stock: string) => void;
  onAddStock: () => void;
  onRemoveStock: () => void;
  startYear: number;
  endYear: number;
  dataMinYear: number;
  dataMaxYear: number;
  onYearRangeChange: (start: number, end: number) => void;
  onReset: () => void;
  onAnalyze: () => void;
  isAnalyzeEnabled: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  fund,
  onFundChange,
  compound,
  onCompoundChange,
  selectedStock,
  stockSymbols,
  onStockChange,
  onAddStock,
  onRemoveStock,
  startYear,
  endYear,
  dataMinYear,
  dataMaxYear,
  onYearRangeChange,
  onReset,
  onAnalyze,
  isAnalyzeEnabled,
}) => {
  const [tempStartYear, setTempStartYear] = React.useState(startYear);
  const [tempEndYear, setTempEndYear] = React.useState(endYear);

  // Update temp values when props change
  React.useEffect(() => {
    setTempStartYear(startYear);
    setTempEndYear(endYear);
  }, [startYear, endYear]);

  // Handle slider movement (only update display text)
  const handleSliderChange = (start: number, end: number) => {
    setTempStartYear(start);
    setTempEndYear(end);
  };

  // Handle when slider drag is complete (update chart)
  const handleSliderComplete = (start: number, end: number) => {
    onYearRangeChange(start, end);
  };

  return (
    <div className={styles.controlPanel}>
      <form>
        <table className={styles.controlTable}>
          <tbody>
            <tr>
              <td>
                <div className={`input-group ${styles.inputGroup}`}>
                  <div className="input-group-prepend">
                    <span className="input-group-text">$</span>
                  </div>
                  <input
                    type="number"
                    className="form-control"
                    value={fund}
                    onChange={(e) => onFundChange(Number(e.target.value))}
                    style={{ width: "100px" }}
                  />
                  <div className="input-group-append">
                    <span className="input-group-text">.00</span>
                  </div>
                </div>
                <div className={styles.compoundContainer}>
                  <input
                    type="checkbox"
                    id="compoundCheckBox"
                    checked={compound}
                    onChange={(e) => onCompoundChange(e.target.checked)}
                    disabled
                  />
                  &nbsp;Compounded
                </div>
              </td>
              <td>
                <table style={{ border: "1px solid #ccc" }}>
                  <tbody>
                    <tr>
                      <td>
                        <select
                          className="form-control"
                          value={selectedStock}
                          onChange={(e) => onStockChange(e.target.value)}
                          style={{ width: "118px" }}
                        >
                          <option value="">--- stock ---</option>
                          {stockSymbols.map((symbol) => (
                            <option key={symbol} value={symbol}>
                              {symbol}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div>
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={onAddStock}
                            style={{ padding: "2px 4px" }}
                          >
                            <i className="fa fa-plus"></i>
                          </button>
                        </div>
                        <div style={{ marginTop: "3px" }}>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={onRemoveStock}
                            style={{ padding: "2px 4px" }}
                          >
                            <i className="fa fa-minus"></i>
                          </button>
                        </div>
                      </td>
                      <td>
                        <label
                          style={{
                            width: "90px",
                            fontWeight: "bold",
                          }}
                        >
                          {selectedStock
                            ? `${tempStartYear} - ${tempEndYear}`
                            : ""}
                        </label>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3}>
                        <DualRangeSlider
                          min={dataMinYear}
                          max={dataMaxYear}
                          startValue={tempStartYear}
                          endValue={tempEndYear}
                          disabled={!selectedStock}
                          onChange={handleSliderChange}
                          onChangeComplete={handleSliderComplete}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td style={{ textAlign: "center" }}>
                <button
                  type="button"
                  className="btn btn-primary me-2"
                  onClick={onReset}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onAnalyze}
                  disabled={!isAnalyzeEnabled}
                >
                  Analyze
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
};

export default ControlPanel;
