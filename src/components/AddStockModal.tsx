import React, { useState, useEffect } from "react";

interface AddStockModalProps {
  show: boolean;
  onClose: () => void;
  onAddStock: (symbol: string) => Promise<{ success: boolean; error?: string }>;
  availableSymbols: string[];
}

const AddStockModal: React.FC<AddStockModalProps> = ({
  show,
  onClose,
  onAddStock,
  availableSymbols,
}) => {
  const [symbol, setSymbol] = useState<string>("");
  const [filteredSymbols, setFilteredSymbols] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (symbol.length > 0) {
      const filtered = availableSymbols
        .filter((s) => s.toLowerCase().includes(symbol.toLowerCase()))
        .slice(0, 10);
      setFilteredSymbols(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [symbol, availableSymbols]);

  const handleAdd = async () => {
    if (!symbol.trim()) return;

    setLoading(true);
    setError("");

    try {
      const result = await onAddStock(symbol.trim());
      if (result.success) {
        setSymbol("");
        onClose();
      } else {
        setError(result.error || "Failed to add stock. Please check the symbol.");
      }
    } catch (err) {
      setError("An unexpected error occurred while adding the stock.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSymbol(suggestion);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
    >
      <div className="modal-dialog modal-sm">
        <div 
          className="modal-content" 
          style={{ 
            backgroundColor: "#2d2d2d", 
            border: "1px solid #444",
            color: "#ffffff" 
          }}
        >
          <div 
            className="modal-header" 
            style={{ 
              backgroundColor: "#333", 
              borderBottom: "1px solid #444",
              color: "#ffffff" 
            }}
          >
            <h5 className="modal-title" style={{ color: "#ffffff" }}>Add Stock Symbol</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
              style={{ 
                filter: "invert(1)",
                backgroundColor: "transparent" 
              }}
            ></button>
          </div>
          <div className="modal-body" style={{ backgroundColor: "#2d2d2d" }}>
            <div className="form-group position-relative">
              <input
                type="text"
                className="form-control"
                placeholder="Symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                autoComplete="off"
                autoFocus
              />
              {showSuggestions && filteredSymbols.length > 0 && (
                <div
                  className="position-absolute border mt-1 w-100"
                  style={{
                    backgroundColor: "#333",
                    borderColor: "#555",
                    color: "#ffffff",
                    zIndex: 1000,
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {filteredSymbols.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 border-bottom cursor-pointer"
                      style={{ 
                        cursor: "pointer", 
                        borderColor: "#555",
                        color: "#ffffff" 
                      }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#444")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#333")
                      }
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {error && (
              <div 
                className="alert mt-2" 
                role="alert"
                style={{
                  backgroundColor: "#dc3545",
                  borderColor: "#dc3545",
                  color: "#ffffff",
                  border: "1px solid #dc3545",
                  borderRadius: "0.375rem",
                  padding: "0.75rem 1.25rem"
                }}
              >
                {error}
              </div>
            )}
          </div>
          <div 
            className="modal-footer" 
            style={{ 
              backgroundColor: "#333", 
              borderTop: "1px solid #444" 
            }}
          >
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAdd}
              disabled={loading || !symbol.trim()}
            >
              {loading ? "Adding..." : "Add"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStockModal;
