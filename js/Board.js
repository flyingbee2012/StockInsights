class Board {
    constructor(
        $historyPanel,
        $summary1,
        $summary2,
        $summary3,
        $resetButton,
        $analysisButton,
        $stockChart,
        $stockSelect,
        $fundBox,
        $metricsBox,
        $compoundCheckBox,
        $strategySelect,
        $timeRangeInput,
        $sliderRange
    ) {

        this.strategyDescription = {
            "Averaging Down": "Sells stocks when price increases (by UB); When price drops (by LB), purchases more (by T), and so on [UB1,LB1,T1,UB2,LB2,T2,...UB]",
            "Averaging Down Lazy": "Hold stocks until price drops (by LB) and purchase more (by T) and sell all when price increases (by UB) [LB, #, LB, #, ....., UB]",
            "Long Term": "Purchase all from start time and sell all at end time"
        };

        this.$historyPanel = $historyPanel;
        this.$summary1 = $summary1;
        this.$summary2 = $summary2;
        this.$summary3 = $summary3;
        this.$resetButton = $resetButton;
        this.$analysisButton = $analysisButton;
        this.$stockChart = $stockChart;
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

        this.populateStocksSelect();

        this.$summary1[0].onclick = () => {
            this.selectSummaryPanel(this.$summary1);
        };
        this.$summary2[0].onclick = () => {
            this.selectSummaryPanel(this.$summary2);
        };
        this.$summary3[0].onclick = () => {
            this.selectSummaryPanel(this.$summary3);
        };
        this.$resetButton[0].onclick = () => {
            this.reset();
        }
        this.$analysisButton[0].onclick = () => {
            this.onAnalysisClick();
        }
        this.$strategySelect[0].onchange = () => {
            this.populateMetrics();
            this.updateStrategyTitle();
            this.updateAnalyzeButton();
        }
        this.$stockSelect[0].onchange = () => {
            this.loadStockDataAndUpdateDateRangeAndStockChart();
            this.updateAnalyzeButton();
        }
        this.$fundBox[0].onchange = () => {
            this.updateAnalyzeButton();
        }
        this.$metricsBox[0].onchange = () => {
            this.updateAnalyzeButton();
        }

        this.$sliderRange.slider();
    }

    // "6/1/2012" => "2012-6-1"
    convertToEpochTime(dateTime) {
        var strList = dateTime.split("/");
        var res = strList[2] + "-" + strList[0] + "-" + strList[1];
        return res;
    }

    getStep(capacity, start, end) {
        var years = end - start + 1;
        var workdaysPerYear = 253;
        var total = years * workdaysPerYear;
        return Math.ceil(total / capacity);
    }


    processDataForStockChart(data, startYear, endYear) {
        var capacity = 1200;
        var step = this.getStep(capacity, startYear, endYear);
        var stockChartData = [];
        for (var i = 0; i < data.length; i += step) {
            var price = data[i];
            var strList = price.dateTime.split("/");
            var year = strList[2];
            var month = strList[0];
            var day = strList[1];
            if (year >= startYear && year <= endYear) {
                var dt = year + "-" + month + "-" + day;
                var closePrice = price.closePrice;
                stockChartData.push({ date: dt, value: closePrice });
            }
        }
        return stockChartData;
    }

    clearStockChart() {
        if (this.$stockChart) {
            this.$stockChart[0].innerHTML = "";
        }
    }

    updateStockChart(stockData, stockName, startYear, endYear) {
        if (stockData == null) {
            return;
        }

        this.clearStockChart();

        var chartData = this.processDataForStockChart(stockData, startYear, endYear);
        var dates = [];

        for (var i = 0; i < chartData.length; i++) {
            var innerArr = [chartData[i].date, chartData[i].value];
            dates.push(innerArr);
        }

        var options = {
            //colors: ['#66DA26', '#2E93fA'],
            series: [{
                name: stockName,
                data: dates
            }],
            chart: {
                type: 'area',
                stacked: false,
                height: 210,
                width: '95%',
                zoom: {
                    type: 'x',
                    enabled: true,
                    autoScaleYaxis: true
                },
                toolbar: {
                    autoSelected: 'zoom'
                }
            },
            dataLabels: {
                enabled: false
            },
            markers: {
                size: 0,
            },
            title: {
                text: stockName,
                align: 'left'
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    inverseColors: false,
                    opacityFrom: 0.5,
                    opacityTo: 0,
                    stops: [0, 90, 100]
                },
            },
            /*fill: {
                colors: [function ({ value, seriesIndex, w }) {
                    if (value < 155) {
                        return '#7E36AF'
                    } else if (value >= 155 && value < 180) {
                        return '#164666'
                    } else {
                        return '#D9534F'
                    }
                }]
            },*/
            yaxis: {
                labels: {
                    formatter: function (val) {
                        return val.toFixed(2);
                    },
                },
                title: {
                    text: 'Price'
                },
            },
            xaxis: {
                type: 'datetime',
            },
            tooltip: {
                shared: false,
                y: {
                    formatter: function (val) {
                        return val.toFixed(3)
                    }
                }
            }
        };

        var chart = new ApexCharts(this.$stockChart[0], options);
        chart.render();
    }

    updateStrategyTitle() {
        var selectedStrategyIndex = this.$strategySelect[0].selectedIndex;
        var selectedStrategy = this.$strategySelect[0].options[selectedStrategyIndex].text;
        var title = (this.strategyDescription[selectedStrategy] == undefined) ? "" : this.strategyDescription[selectedStrategy];
        this.$strategySelect.prop("title", title);
    }

    populateStocksSelect() {
        var option = document.createElement("option");
        option.text = "- stock -";
        this.$stockSelect[0].add(option);
        $.ajax({
            type: "GET",
            url: "stockdata/stocks.txt",
            dataType: "text",
            context: this,
            success: function (data) {
                var allTextLines = data.split(/\r\n|\n/);
                for (var i = 0; i < allTextLines.length; i++) {
                    var option = document.createElement("option");
                    option.text = allTextLines[i];
                    this.$stockSelect[0].add(option);
                }
            },
            error: function () {
                alert("cannot load data");
            }
        });
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
            this.$timeRangeInput[0].innerHTML = " " + this.startYear + " - " + this.endYear;
            this.$sliderRange.slider(
                {
                    range: true,
                    min: this.startYear,
                    max: this.endYear,
                    step: 1,
                    values: [this.startYear, this.endYear],
                    slide: (event, ui) => {
                        this.$timeRangeInput[0].innerHTML = " " + ui.values[0] + " - " + ui.values[1];
                        this.startYear = ui.values[0];
                        this.endYear = ui.values[1];
                    }
                }
            );
        }
    }

    loadStockDataAndUpdateDateRangeAndStockChart() {
        if (this.$stockSelect[0].selectedIndex == 0) {
            this.clearStockChart();
            this.$timeRangeInput[0].innerHTML = "0000 - 0000";
            return;
        }

        var filePath = this.getFilePath();

        if (filePath != "") {
            $.ajax({
                type: "GET",
                url: filePath,
                dataType: "text",
                context: this,
                success: function (data) {
                    var prices = this.convertRawDataToList(data);
                    this.startYear = Number(prices[0].dateTime.split("/")[2]);
                    this.endYear = Number(prices[prices.length - 1].dateTime.split("/")[2]);
                    this.data = prices;

                    var stockName = this.getStockName();
                    this.updateStockChart(prices, stockName, this.startYear, this.endYear);
                    this.updateDateRange();
                },
                error: function () {
                    alert("cannot load data");
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
            this.clearStockChart();
            this.$selectedSummary = $summary;
            $summary.css('border', '3px solid red');
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
        this.clearHistoryPanel();
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

            this.displayHistoricalDataAndStockChart(filePath, fund, metrics, startYear, endYear, compound, strategyType, selectedStock, this.$historyPanel);
        }
    }

    clearSummaryPanel($panel) {
        if ($panel != null) {
            $panel[0].innerHTML = "";
        }
    }

    clearHistoryPanel() {
        if (this.$historyPanel) {
            this.$historyPanel[0].innerHTML = "";
        }
    }

    reset() {
        this.summaryMapping = {};
        this.clearHistoryPanel();
        this.clearSummaryPanel(this.$summary1);
        this.clearSummaryPanel(this.$summary2);
        this.clearSummaryPanel(this.$summary3);
        this.clearStockChart();
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
    displayHistoricalDataAndStockChart(filePath, fund, metrics, startYear, endYear, compound, selectedStrategy, selectedStock, $historyCanvas) {
        $.ajax({
            type: "GET",
            url: filePath,
            dataType: "text",
            context: this,
            success: function (data) {
                var processedData = this.convertRawDataToList(data);

                // update stock chart
                this.updateStockChart(processedData, selectedStock, startYear, endYear)

                this.applyStrategy(processedData, startYear, endYear, fund, compound, metrics, selectedStock, selectedStrategy, $historyCanvas, null);
            },
            error: function () {
                alert("cannot load data");
            }
        });
    }

    // data (this.data) is ready, just need to display it
    displayAllData(data, fund, metrics, startYear, endYear, compound, selectedStrategy, selectedStock, $historyCanvas, $summaryCanvas) {
        this.applyStrategy(data, startYear, endYear, fund, compound, metrics, selectedStock, selectedStrategy, $historyCanvas, $summaryCanvas);
    }

    getStockName() {
        var selectedIndex = this.$stockSelect[0].selectedIndex;
        if (selectedIndex == 0) {
            return "";
        }
        var selectedStock = this.$stockSelect[0].options[selectedIndex].text
        return selectedStock;
    }

    getFilePath() {
        return "stockdata/" + this.getStockName() + ".csv";
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

            this.updateStockChart(this.data, selectedStock, this.startYear, this.endYear);
            this.clearHistoryPanel();
            this.clearSummaryPanel(this.$selectedSummary);
            this.displayAllData(this.data, fund, metrics, this.startYear, this.endYear, compound, selectedStrategy, selectedStock, this.$historyPanel, this.$selectedSummary);
        }
    }
};