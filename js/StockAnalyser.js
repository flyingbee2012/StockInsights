class StockAnalyser {
    constructor(invest, stockInfo, strategyType, $historyCanvas, $summaryCanvas) {
        this.baseFund = invest;
        this.investment = invest;
        this.stockInfo = stockInfo;
        this.startYear = null;
        this.endYear = null;
        this.strategyType = strategyType;
        this.longestTrade = null;
        this.strategy = null;
        this.prices = [];
        this.peaks = [];

        this.biggestDropFromPrice = 0.0;
        this.biggestDropFromPriceDate = null;
        this.biggestDropEndPrice = 0.0;
        this.biggestDropEndPriceDate = null;

        this.$historyCanvas = $historyCanvas;
        this.$summaryCanvas = $summaryCanvas;
    }

    loadStrategy(_strategy) {
        this.strategy = _strategy;
    }

        /*
        outputData() {
            for (price of this.prices) {
                cout << price.dateTime << "\t\t" << price.openPrice << "\t\t" << price.highPrice << "\t\t" << price.lowPrice << "\t\t" << price.closePrice << endl;
            }
            cout << endl;
        }*/
    
        /*void outputPeaks() {
            for (int i : peaks) {
                cout << prices[i].dateTime << "\t\t" << prices[i].closePrice << endl;
            }
            cout << endl;
        }*/

        getYear(dateTimeString) {
            return Number(dateTimeString.split("/")[2]);
        }

        loadAndProcessData(prices, startYear, endYear) {
            this.startYear = startYear;
            this.endYear = endYear;

            var maxDrop = Number.MIN_SAFE_INTEGER;
            var highestPrice = Number.MIN_SAFE_INTEGER;
            var highestPriceDate = null;

            for (var i = 0; i < prices.length; i++) {
                var dt = this.getYear(prices[i].dateTime);
                if (dt >= startYear && dt <= endYear) {  
                    if (prices[i].highPrice > highestPrice) {
                        highestPrice = prices[i].highPrice;
                        highestPriceDate = prices[i].dateTime;
                    }
                    if (highestPrice - prices[i].lowPrice > maxDrop) {
                        maxDrop = highestPrice - prices[i].lowPrice;
                        this.biggestDropFromPrice = highestPrice;
                        this.biggestDropFromPriceDate = highestPriceDate;
                        this.biggestDropEndPrice = prices[i].lowPrice;
                        this.biggestDropEndPriceDate = prices[i].dateTime;
                    }                                           
                          
                    this.prices.push(prices[i]);
                }
            }
        }
    
        applyStrategyFromPrice(index) {
            var trade = new Trade(this.prices.length - 1);
            var baseAmount = this.strategy.getBasePurchaseAmount(this.investment, this.prices[index].closePrice);
            var times = 1;
    
            var amount = baseAmount * times;
    
            var lowerBound = -1.0;
            var upperBound = Number.MAX_VALUE;
    
            trade.purchase(amount, this.prices[index].closePrice, this.prices[index].dateTime, index);
    
            if (this.strategy.hasMore()) {
                lowerBound = this.prices[index].closePrice * (1.0 - this.strategy.getCurrentDropPct());
                upperBound = this.prices[index].closePrice * (1.0 + this.strategy.getCurrentSalePct());
                times = this.strategy.getCurrentPurchaseTimes();
                amount = baseAmount * times;
                this.strategy.moveToNext();
            }
    
            for (var i = index + 1; i < this.prices.length; i++) {
                var lowestPrice = this.prices[i].lowPrice;
                var highestPrice = this.prices[i].highPrice;

                if (lowestPrice <= lowerBound && highestPrice >= upperBound) {
                    console.log("large diff: " + this.prices[i].dateTime + "\n");
                    /*var lowFirst = (Math.random() >= 0.5);
                    if (lowFirst) {
                        highestPrice = -1.0;
                    }
                    else {
                        lowestPrice = Number.MAX_VALUE;
                    }*/
                }

                if (lowestPrice <= lowerBound) {
                    trade.purchase(amount, lowerBound, this.prices[i].dateTime, i);
                    if (this.strategy.hasMore()) {
                        lowerBound = trade.getCostBasis() * (1.0 - this.strategy.getCurrentDropPct());
                        upperBound = trade.getCostBasis() * (1.0 + this.strategy.getCurrentSalePct());
                        times = this.strategy.getCurrentPurchaseTimes();
                        amount = baseAmount * times;
                        this.strategy.moveToNext();
                    }
                    else {
                        lowerBound = -1.0;
                    }
                }
                // earned profit and stop
                else if (highestPrice >= upperBound) {
                    trade.sellAll(upperBound, this.prices[i].dateTime, i);
                    this.strategy.reset();
                    return trade;
                }
            }
    
            this.strategy.reset();
            return trade;
        }
    
        getNextPeak(pks, target) {
            var start = 0, end = pks.length - 1;
            while (start + 1 < end) {
                var mid = start + (end - start) / 2;
                if (pks[mid] > target) {
                    end = mid;
                }
                else {
                    start = mid;
                }
            }
            if (pks[end] > target) {
                return end;
            }
            return Number.MAX_SAFE_INTEGER;
        }
    
        // apply strategy on each peak
        /*void applyStrategyOnPeaks() {
            int maxDays = -1;
            Trade* trade = NULL;
            float totoalProfit = 0.0f;
            for (int peakIndex : peaks) {
                trade = applyStrategyFromPrice(peakIndex);
                totoalProfit += trade->getProfit();
                trade->output();
                if (trade->getNumOfTradeDays() > maxDays) {
                    maxDays = trade->getNumOfTradeDays();
                    longestTrade = trade;
                }
            }
            cout << "************************** Longest Trade ***************************" << endl << endl;
            longestTrade->output();
            cout << "********************************************************************" << endl;
            cout << "total profit (with overlap): " << totoalProfit << endl;
        }*/
    
        /*void applyStrategyOnPeaksContinuously() {
            int maxDays = -1;
            Trade* trade = NULL;
            float totoalProfit = 0.0f;
            float totoalDays = 0.0f;
            unsigned int i = 0;
            float count = 0.0f;
            while (i < peaks.size()) {
                int peakIndex = peaks[i];
                trade = applyStrategyFromPrice(peakIndex);
                totoalProfit += trade->getProfit();
                totoalDays += trade->getNumOfTradeDays();
                count++;
                trade->output();
                if (trade->getNumOfTradeDays() > maxDays) {
                    maxDays = trade->getNumOfTradeDays();
                    longestTrade = trade;
                }
                i = getNextPeak(peaks, trade->getEndIndex());
            }
    
            if (longestTrade != NULL) {
                cout << "************************** Longest Trade ***************************" << endl << endl;
                longestTrade->output();
                cout << "********************************************************************" << endl;
            }
    
            cout << "total profit: " << totoalProfit << endl;
            cout << "average day to make profit: " << totoalDays / count << endl;
        }*/

        applyLongTermStrategy() {
            var trade = new Trade(this.prices.length - 1);
            var startPrice = this.prices[0].closePrice;
            var endPrice = this.prices[this.prices.length - 1].closePrice;
            var amount = this.investment / startPrice;
            trade.purchase(amount, startPrice, this.prices[0].dateTime, 0);
            trade.sellAll(endPrice, this.prices[this.prices.length - 1].dateTime, this.prices.length - 1);
            if (this.$historyCanvas) {
                trade.output(this.$historyCanvas);
                this.$historyCanvas.append("<hr>");
            }
            var totalProfit = trade.getProfit();

            this.outputSummaryData(
                this.$summaryCanvas,
                trade,
                this.stockInfo,
                this.baseFund,
                this.strategyType,
                "",
                totalProfit.toFixed(3),
                totalProfit.toFixed(3),
                trade.getNumOfTradeDays(),
                false,
                this.biggestDropFromPrice.toFixed(3),
                this.biggestDropFromPriceDate,
                this.biggestDropEndPrice.toFixed(3),
                this.biggestDropEndPriceDate
            );

        }
    
        // only applies for 2 strategies
        applyStrategyContinuously(withCompound) {
            if (this.strategyType != "Averaging Down Lazy" && this.strategyType != "Averaging Down") {
                return;
            }

            var maxDays = -1;
            var totoalProfit = 0.0;
            var historicalProfit = 0.0;
            var totoalDays = 0.0;
            var i = 0;
            var count = 0.0;

            while (i < this.prices.length) {
                var trade = (this.strategyType === "Averaging Down") ? this.applyStrategyFromPrice(i) : this.applyLazyStrategyFromPrice(i);
                historicalProfit += Math.max(0.0, trade.getProfit());
                totoalProfit += trade.getProfit();
                if (withCompound) {
                    this.investment += trade.getProfit();
                }
                totoalDays += trade.getNumOfTradeDays();
                count++;
                if (this.$historyCanvas) {
                    trade.output(this.$historyCanvas);
                    this.$historyCanvas.append("<hr>");
                }
                if (trade.getNumOfTradeDays() > maxDays) {
                    maxDays = trade.getNumOfTradeDays();
                    this.longestTrade = trade;
                }
                i = trade.getEndIndex() + 1;
            }

            this.outputSummaryData(
                this.$summaryCanvas, 
                this.longestTrade,
                this.stockInfo,
                this.baseFund,
                this.strategyType,
                this.strategy.getString(),
                historicalProfit.toFixed(3),
                totoalProfit.toFixed(3),
                (totoalDays / count).toFixed(3),
                withCompound,
                this.biggestDropFromPrice.toFixed(3),
                this.biggestDropFromPriceDate,
                this.biggestDropEndPrice.toFixed(3),
                this.biggestDropEndPriceDate
            );

        }

        getDropPct(drpFromPrice, drpEndPrice) {
            var n = ((drpFromPrice - drpEndPrice) / drpFromPrice) * 100;
            n = n.toFixed(3);
            return n.toString() + "%";
        }

        outputSummaryData(
            $canvas, 
            longestTrade, 
            stockInfo, 
            baseFund, 
            strategyType, 
            metrics, 
            hProfit, 
            tProfit, 
            avgDays, 
            withCompound, 
            dropFromPrice, 
            dropFromDate,
            dropEndPrice,
            dropEndDate   
            ) {
            
                if ($canvas) {
                if (longestTrade != null) {        
                    $canvas.append("<center>--- " + stockInfo + " (" + this.startYear + " - " + this.endYear + ") with $" + baseFund + " ---</center>");
                    $canvas.append("<center>----- " + strategyType + " -----</center>");
                    $canvas.append("<center>---" + metrics + " Compounded: " + withCompound + " ---</center><br style='line-height: 10px;'>");
                    $canvas.append("****************** Longest Trade ******************</br>");
                    longestTrade.output($canvas);
                    $canvas.append("*****************************************************" + "</br>");
                }

                $canvas.append("historical profit: <font color='red'>" + hProfit + "</font></br>");
                $canvas.append("total profit so far: <font color='red'>" + tProfit + "</font></br>");
                $canvas.append("average day to make profit: " + avgDays + "</br>");

                $canvas.append("*****************************************************" + "</br>");
                //$canvas.append("max drop: From " + this.biggestDropFromPrice + " (" + this.biggestDropFromPriceDate + ") To " + this.biggestDropEndPrice + "(" + this.biggestDropEndPriceDate + ")");
                $canvas.append("max drop: " 
                    + "(" + this.getDropPct(dropFromPrice, dropEndPrice) + ") " + dropFromPrice 
                    + " (" + dropFromDate + ") => " + dropEndPrice + " (" + dropEndDate + ")"
                );     
            }
        }

        // [LB, #, LB, #, ....., UB]
        applyLazyStrategyFromPrice(index) {
            var trade = new Trade(this.prices.length - 1);
            var baseAmount = this.strategy.getBasePurchaseAmount(this.investment, this.prices[index].closePrice);
            var times = 1;
    
            var amount = baseAmount * times;
            var peakValue = this.prices[index].closePrice;
            var lowerBound = -1.0;
            var upperBound = Number.MAX_VALUE;
            var dropPct = 0;
    
            trade.purchase(amount, this.prices[index].closePrice, this.prices[index].dateTime, index);
    
            if (this.strategy.hasMore()) {
                dropPct = this.strategy.getCurrentDropPct();
                lowerBound = this.prices[index].closePrice * (1.0 - dropPct);
                times = this.strategy.getCurrentPurchaseTimes();
                amount = baseAmount * times;
                this.strategy.moveToNext();
            }
    
            for (var i = index + 1; i < this.prices.length; i++) {
                var lowestPrice = this.prices[i].lowPrice;
                var highestPrice = this.prices[i].highPrice;

                if (lowestPrice <= lowerBound) {
                    trade.purchase(amount, lowerBound, this.prices[i].dateTime, i);
                    if (this.strategy.hasMore()) {
                        dropPct = this.strategy.getCurrentDropPct();
                        times = this.strategy.getCurrentPurchaseTimes();
                        amount = baseAmount * times;
                        this.strategy.moveToNext();
                    }
                    else {
                        lowerBound = -1.0; // will make it stop from purchasing more when price drops lower next time
                        upperBound = trade.getCostBasis() * (1.0 + this.strategy.getSalePct()); // will make it sell all stocks when price gets higher
                    }
                }
                // earned profit and stop
                else if (highestPrice >= upperBound) {
                    trade.sellAll(upperBound, this.prices[i].dateTime, i);
                    this.strategy.reset();
                    return trade;
                }

                peakValue = Math.max(peakValue, highestPrice);
                lowerBound = (lowerBound == -1.0) ? lowerBound : peakValue * (1.0 - dropPct);   
            }
    
            // if the price never drops below the threshold, sell all stocks at the current price at the end
            var k = this.prices.length - 1;
            trade.sellAll(this.prices[k].closePrice, this.prices[k].dateTime, k);
            this.strategy.reset();
            return trade;
        }
};