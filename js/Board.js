class Board {
    constructor(
        $historyPanel, 
        $summary1, 
        $summary2, 
        $summary3, 
        $analysisButton, 
        $stockSelect, 
        $fundBox, 
        $metricsBox, 
        $compoundCheckBox, 
        $strategySelect,
        $timeRangeInput,
        $sliderRange
        ) {

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
        this.$timeRangeInput = $timeRangeInput;
        this.$sliderRange = $sliderRange;
       
        this.$selectedSummary = null;
        this.summaryMapping = {};
        this.startYear = null;
        this.endYear = null;

        this.data = null;

        this.updateAnalyzeButton();

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
            this.updateAnalyzeButton();
        }
        this.$stockSelect[0].onchange = () => {
            if (this.$stockSelect[0].selectedIndex == 0) {
                this.$timeRangeInput.val("");
            } 
            else {
                this.loadStockDataAndUpdateDateRange();
            }
            this.updateAnalyzeButton();
        }
        this.$fundBox[0].onchange = () => {
            this.updateAnalyzeButton();
        }
        this.$metricsBox[0].onchange = () => {
            this.updateAnalyzeButton();
        }
    }

    isInputValid() {
        var fund = Number(this.$fundBox[0].value);
        var selectedStockIndex = this.$stockSelect[0].selectedIndex;
        var selectedStrategyIndex = this.$strategySelect[0].selectedIndex;
        var selectedStrategy = this.$strategySelect[0].options[selectedStrategyIndex].text;
        var metrics = this.$metricsBox[0].value;
        // Long Term Strategy
        if (fund && selectedStockIndex != 0 && selectedStrategyIndex != 0) {
            if (selectedStrategy != "Long Term") {
                return metrics;
            }
            return true;
        }
        return false;
    }

    updateAnalyzeButton() {
        this.$analysisButton.prop("disabled", !this.isInputValid());
    }

    updateDateRange() {  
        if (this.data) {
            this.$timeRangeInput.val((this.startYear + " - " + this.endYear));
            this.$sliderRange.slider(
                {
                    range: true,
                    min: this.startYear,
                    max: this.endYear,
                    step: 1,
                    values: [this.startYear, this.endYear],
                    slide: (event, ui) => {
                        this.$timeRangeInput.val(ui.values[0]  + " - " + ui.values[1]);
                        this.startYear = ui.values[0];
                        this.endYear = ui.values[1];
                    }
                }
            );
        }
    }

    loadStockDataAndUpdateDateRange() {
        var filePath = this.getFilePath(); 

        if (filePath != "") {
            $.ajax({
                type: "GET",
                url: filePath,
                dataType: "text",
                context: this,
                success: function(data) {
                    var prices = this.convertRawDataToList(data);
                    this.startYear = Number(prices[0].dateTime.split("/")[2]);
                    this.endYear = Number(prices[prices.length - 1].dateTime.split("/")[2]);
                    this.data = prices;

                    this.updateDateRange();
                },
                error: function(data) {
                    alert(data);
                }
            });   
        }
    }

    convertRawDataToList(data) {
        var allTextLines = data.split(/\r\n|\n/);
        var headers = allTextLines[0].split(',');
        var prices = [];
        for (var i = 1; i < allTextLines.length; i++) {
            var data = allTextLines[i].split(',');
            if (data.length == headers.length) {
                var dt = data[0];
                var openPrice = Number(data[1]);
                var highPrice = Number(data[2]);
                var lowPrice = Number(data[3]);
                var closePrice = Number(data[4]);
                prices.push(new Price(dt, openPrice, highPrice, lowPrice, closePrice));               
            }
        }
        return prices;
    }

    selectSummaryPanel($summary) {
        // update summary panel
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
            var startYear = summaryObj.startYear;
            var endYear = summaryObj.endYear;

            this.clearHistoryPanel();
            this.displayHistoricalData(filePath, fund, metrics, startYear, endYear, compound, strategyType, selectedStock, this.$historyPanel);
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
            this.$compoundCheckBox.prop("disabled", false);
            this.$metricsBox.prop("disabled", false);
            this.$metricsBox.val("0.025, 0.025, 4.0, 0.025");
        }
        else if (val === "2") {
            this.$compoundCheckBox.prop("disabled", false);
            this.$metricsBox.prop("disabled", false);
            this.$metricsBox.val("0.025, 4.0, 0.025");
        }
        else {
            this.$metricsBox.val("");
            this.$metricsBox.prop("disabled", true);
            this.$compoundCheckBox.prop("disabled", true);
        }
    }

    applyStrategy(stockData, startYear, endYear, fund, compound, metrics, selectedStock, selectedStrategy, $historyCanvas, $summaryCanvas) {
        var strategyArr = metrics.split(',');
        var strategyInput = [];
        var stockAnalyser = new StockAnalyser(fund, selectedStock, selectedStrategy, $historyCanvas, $summaryCanvas);
        stockAnalyser.loadAndProcessData(stockData, startYear, endYear);
        
        for (var i of strategyArr) {
            i = i.trim();
            strategyInput.push(Number(i));
        }         
        
        var strategy = null;
        if (selectedStrategy === "Averaging Down") {
            strategy = new Strategy(strategyInput);
            stockAnalyser.loadStrategy(strategy);
            stockAnalyser.applyStrategyContinuously(compound);
        }
        else if (selectedStrategy === "Averaging Down Lazy") {
            strategy = new LazyStrategy(strategyInput);
            stockAnalyser.loadStrategy(strategy);
            stockAnalyser.applyStrategyContinuously(compound);
        }
        // long term strategy
        else if (selectedStrategy === "Long Term") {
            stockAnalyser.applyLongTermStrategy();
        }
    }

    // read data based on filePath, need ajax call
    displayHistoricalData(filePath, fund, metrics, startYear, endYear, compound, selectedStrategy, selectedStock, $historyCanvas) {
        $.ajax({
            type: "GET",
            url: filePath,
            dataType: "text",
            context: this,
            success: function(data) {
                var processedData = this.convertRawDataToList(data);
                this.applyStrategy(processedData, startYear, endYear, fund, compound, metrics, selectedStock, selectedStrategy, $historyCanvas, null);
            },
            error: function(data) {
                alert(data);
            }
        });
    }

    // data (this.data) is ready, just need to display it
    displayAllData(data, fund, metrics, startYear, endYear, compound, selectedStrategy, selectedStock, $historyCanvas,  $summaryCanvas) {
        this.applyStrategy(data, startYear, endYear, fund, compound, metrics, selectedStock, selectedStrategy, $historyCanvas, $summaryCanvas);
    }

    getFilePath() {
        var filePath = "";
        var selectedValue = this.$stockSelect[0].value;
        switch (selectedValue) {
            case "1": filePath = "stockdata/AAPL.csv"; break;
            case "2": filePath = "stockdata/AMZN.csv"; break;
            case "3": filePath = "stockdata/FB.csv"; break;
            case "4": filePath = "stockdata/GOOGL.csv"; break;
            case "5": filePath = "stockdata/MSFT.csv"; break;
            case "6": filePath = "stockdata/PYPL.csv"; break;
            case "7": filePath = "stockdata/SPY.csv"; break;
        }
        return filePath;
    }

    onAnalysisClick() {
        var fund = Number(this.$fundBox[0].value);
        var filePath = this.getFilePath();
        var selectedStrategy = "";

        var metrics = this.$metricsBox[0].value;
        var compound = this.$compoundCheckBox[0].checked;
        var selectedIndex = this.$stockSelect[0].selectedIndex;
        var selectedStock = this.$stockSelect[0].options[selectedIndex].text
        var selectedStrategyIndex = this.$strategySelect[0].selectedIndex;
        selectedStrategy = this.$strategySelect[0].options[selectedStrategyIndex].text;

        if (filePath && fund && selectedStrategyIndex != 0) {
            // save input in the object for clicking summary panel
            var selectedSummaryId = this.$selectedSummary[0].id;
            this.summaryMapping[selectedSummaryId] = {};

            this.summaryMapping[selectedSummaryId]["filePath"] = filePath;
            this.summaryMapping[selectedSummaryId]["startYear"] = this.startYear;
            this.summaryMapping[selectedSummaryId]["endYear"] = this.endYear;

            this.summaryMapping[selectedSummaryId]["fund"] = fund;
            this.summaryMapping[selectedSummaryId]["metrics"] = metrics;
            this.summaryMapping[selectedSummaryId]["compound"] = compound;
            this.summaryMapping[selectedSummaryId]["strategyType"] = selectedStrategy;
            this.summaryMapping[selectedSummaryId]["selectedStock"] = selectedStock;
            
            this.clearAllOutput();
            this.displayAllData(this.data, fund, metrics, this.startYear, this.endYear, compound, selectedStrategy, selectedStock, this.$historyPanel, this.$selectedSummary);
        }
    }
};