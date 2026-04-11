import React from "react";

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
  onYearRangeChange,
  onReset,
  onAnalyze,
  isAnalyzeEnabled,
}) => {
  const handleYearChange = (type: "start" | "end", value: number) => {
    if (type === "start") {
      onYearRangeChange(value, endYear);
    } else {
      onYearRangeChange(startYear, value);
    }
  };

  return (
    <div className="control-panel">
      <form>
        <table className="control-table">
          <tbody>
            <tr>
              <td>
                <div className="input-group mb-3">
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
                <div style={{ marginLeft: "5px" }}>
                  <input
                    type="checkbox"
                    id="compoundCheckBox"
                    checked={compound}
                    onChange={(e) => onCompoundChange(e.target.checked)}
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
                          <option value="">- stock -</option>
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
                          {startYear} - {endYear}
                        </label>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3}>
                        <div className="year-range-container">
                          <div className="d-flex">
                            <input
                              type="range"
                              className="form-range me-2"
                              min={startYear}
                              max={endYear}
                              value={startYear}
                              onChange={(e) =>
                                handleYearChange(
                                  "start",
                                  Number(e.target.value),
                                )
                              }
                              style={{ width: "120px" }}
                            />
                            <input
                              type="range"
                              className="form-range"
                              min={startYear}
                              max={endYear}
                              value={endYear}
                              onChange={(e) =>
                                handleYearChange("end", Number(e.target.value))
                              }
                              style={{ width: "120px" }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td rowSpan={2}>{/* Empty cell where textarea used to be */}</td>
            </tr>
            <tr>
              <td>{/* Empty cell where strategy dropdown used to be */}</td>
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
