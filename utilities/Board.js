class Board {
    constructor(
        $historyPanel, 
        $summary1, $summary2, 
        $summary3, 
        $analysisButton, 
        $stockSelect, 
        $fundBox, 
        $metricsBox, 
        $compoundCheckBox, 
        $strategySelect) {

        this.$historyPanel = $historyPanel;
        this.$summary1 = $summary1;
        this.$summary2 = $summary2;
        this.$summary3 = $summary3;
        this.$analysisButton = $analysisButton;
        this.$stockSelect = $stockSelect;
        this.$fundBox = $fundBox;
        this.$metricsBox = $metricsBox;
        this.$compoundCheckBox = $compoundCheckBox;
        this.$strategySelect = $strategySelect;
       
        this.$selectedSummary = null;
        this.summaryMapping = {};

        this.$summary1[0].onclick = () => {
            this.selectSummaryPanel(this.$summary1);
        };
        this.$summary2[0].onclick = () => {
            this.selectSummaryPanel(this.$summary2);
        };
        this.$summary3[0].onclick = () => {
            this.selectSummaryPanel(this.$summary3);
        };
        this.$analysisButton[0].onclick = () => {
            this.onAnalysisClick();
        }
        this.$strategySelect[0].onchange = () => {
            this.populateMetrics();
        }
    }

    selectSummaryPanel($summary) {
        // udpate summary panel
        if (this.$selectedSummary == null || $summary[0].id != this.$selectedSummary[0].id) {
            this.$selectedSummary = $summary;
            $summary.css('border', '3px solid blue'); 
            if ($summary[0].id != this.$summary1[0].id) {
                this.$summary1.css('border', 'none')
            }
            if ($summary[0].id != this.$summary2[0].id) {
                this.$summary2.css('border', 'none')
            }
            if ($summary[0].id != this.$summary3[0].id) {
                this.$summary3.css('border', 'none')
            }
        }
        // update history panel
        var summaryId = $summary[0].id;
        if (this.summaryMapping[summaryId] != null) {
            var summaryObj = this.summaryMapping[summaryId];
            var filePath = summaryObj.filePath;
            var fund = summaryObj.fund;
            var metrics = summaryObj.metrics;
            var compound = summaryObj.compound;
            var strategyType = summaryObj.strategyType;
            var selectedStock = summaryObj.selectedStock;

            this.clearHistoryPanel();
            this.displayResult(filePath, fund, metrics, compound, strategyType, selectedStock, this.$historyPanel, null);
        }

    }

    clearAllOutput() {
        this.clearHistoryPanel();
        if (this.$selectedSummary != null) {
            this.$selectedSummary[0].innerHTML = "";
        }
    }

    clearHistoryPanel() {
        if (this.$historyPanel) {
            this.$historyPanel[0].innerHTML = "";
        }
    }

    populateMetrics() {
        var val = this.$strategySelect[0].value;
        if (val === "1") {
            this.$metricsBox.val("0.025, 0.025, 4.0, 0.025");
        }
        else {
            this.$metricsBox.val("0.025, 4.0, 0.025");
        }
    }

    displayResult(filePath, fund, metrics, compound, strategyType, selectedStock, $historyCanvas, $summaryCanvas) {
        if (filePath != "") {
            $.ajax({
                type: "GET",
                url: filePath,
                dataType: "text",

                success: function(data) {
                    var strategyArr = metrics.split(',');
                    var strategyInput = [];
                    for (var i of strategyArr) {
                        i = i.trim();
                        strategyInput.push(Number(i));
                    }         
                    
                    var strategy = null;
                    if (strategyType === "1") {
                        strategy = new Strategy(strategyInput);
                    }
                    else if (strategyType === "2") {
                        strategy = new LazyStrategy(strategyInput);
                    }

                    if (strategy && fund && selectedStock) {
                        var stockAnalyser = new StockAnalyser(fund, selectedStock, $historyCanvas, $summaryCanvas);
                        stockAnalyser.loadStrategy(strategy);
                        stockAnalyser.processData(data);
                        stockAnalyser.applyStrategyContinuously(compound);
                    }
                },
                error: function(data) {
                    alert(data);
                }
            });  
        }
    }

    onAnalysisClick() {
        var selectedValue = this.$stockSelect[0].value;
        var fund = Number(this.$fundBox[0].value);
        var filePath = "";
        switch (selectedValue) {
            case "1": filePath = "stockdata/AAPL_2019.csv"; break;
            case "2": filePath = "stockdata/AAPL_5years.csv"; break;
            case "3": filePath = "stockdata/AAPL_10years.csv"; break;
            case "4": filePath = "stockdata/PYPL_2019.csv"; break;
            case "5": filePath = "stockdata/SPY_2019.csv"; break;
        }
        var metrics = this.$metricsBox[0].value;
        var compound = this.$compoundCheckBox[0].checked;
        var selectedIndex = this.$stockSelect[0].selectedIndex;
        var selectedStock = this.$stockSelect[0].options[selectedIndex].text
        var strategyType = this.$strategySelect[0].value;

        var selectedSummaryId = this.$selectedSummary[0].id;
        this.summaryMapping[selectedSummaryId] = {};
        this.summaryMapping[selectedSummaryId]["filePath"] = filePath;
        this.summaryMapping[selectedSummaryId]["fund"] = fund;
        this.summaryMapping[selectedSummaryId]["metrics"] = metrics;
        this.summaryMapping[selectedSummaryId]["compound"] = compound;
        this.summaryMapping[selectedSummaryId]["strategyType"] = strategyType;
        this.summaryMapping[selectedSummaryId]["selectedStock"] = selectedStock;
        
        this.clearAllOutput();
        this.displayResult(filePath, fund, metrics, compound, strategyType, selectedStock, this.$historyPanel, this.$selectedSummary);
    }
};