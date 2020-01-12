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
    }

    clearOutput() {
        this.$historyPanel[0].innerHTML = "";
        /*this.$summary1[0].innerHTML = "";
        this.$summary2[0].innerHTML = "";
        this.$summary3[0].innerHTML = "";*/
        if (this.$selectedSummary != null) {
            this.$selectedSummary[0].innerHTML = "";
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

    onAnalysisClick(data) {          
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

        if (filePath != "") {
            this.clearOutput();
            var that = this;
            $.ajax({
                type: "GET",
                url: filePath,
                dataType: "text",
                //context: this,
                success: function(data) {
                    var metrics = that.$metricsBox[0].value;
                    var strategyArr = metrics.split(',');
                    var strategyInput = [];
                    var compound = that.$compoundCheckBox[0].checked;
                    for (var i of strategyArr) {
                        i = i.trim();
                        strategyInput.push(Number(i));

                    }         
                    
                    var strategy = null;
                    if (that.$strategySelect[0].value === "1") {
                        strategy = new Strategy(strategyInput);
                    }
                    else {
                        strategy = new LazyStrategy(strategyInput);
                    }

                    var selectedIndex = that.$stockSelect[0].selectedIndex;
                    var selectedStock = that.$stockSelect[0].options[selectedIndex].text
                    var stockAnalyser = new StockAnalyser(fund, selectedStock, that.$historyPanel, that.$selectedSummary);
                    stockAnalyser.loadStrategy(strategy);
                    stockAnalyser.processData(data);
                    stockAnalyser.applyStrategyContinuously(compound);
                },
                error: function(data) {
                    alert(data);
                }
            });  
        }
    }
};