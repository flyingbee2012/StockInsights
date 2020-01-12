class StockAnalyser {
    constructor(invest, stockInfo, $historyCanvas, $summaryCanvas) {
        this.baseFund = invest;
        this.investment = invest;
        this.stockInfo = stockInfo;
        this.longestTrade = null;
        this.strategy = null;
        this.prices = [];
        this.peaks = [];
        this.$historyCanvas = $historyCanvas;
        this.$summaryCanvas = $summaryCanvas;
        this.strategyType = "";
    }

    loadStrategy(_strategy) {
        this.strategy = _strategy;
        this.strategyType = _strategy.type;
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

        processData(allText) {
            var allTextLines = allText.split(/\r\n|\n/);
            var headers = allTextLines[0].split(',');
            var ppPrice = -1, pPrice = -1;

            for (var i = 1; i < allTextLines.length; i++) {
                var data = allTextLines[i].split(',');
                if (data.length == headers.length) {
                    var dt = data[0];
                    var openPrice = Number(data[1]);
                    var highPrice = Number(data[2]);
                    var lowPrice = Number(data[3]);
                    var closePrice = Number(data[4]);

                    // first point
                    if (ppPrice == -1 && pPrice == -1) {
                        pPrice = closePrice;
                    }
                    // second point
                    else if (ppPrice == -1) {
                        ppPrice = pPrice;
                        pPrice = closePrice;
                    }
                    else {
                        if (ppPrice < pPrice && closePrice < pPrice) {
                            this.peaks.push(this.prices.length - 1);
                        }
                        ppPrice = pPrice;
                        pPrice = closePrice;
                    }

                    this.prices.push(new Price(dt, openPrice, highPrice, lowPrice, closePrice));
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
    
        applyStrategyContinuously(withCompound) {
            var maxDays = -1;
            var totoalProfit = 0.0;
            var historicalProfit = 0.0;
            var totoalDays = 0.0;
            var i = 0;
            var count = 0.0;

            while (i < this.prices.length) {
                var trade = (this.strategyType === "Traditional") ? this.applyStrategyFromPrice(i) : this.applyLazyStrategyFromPrice(i);
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

            if (this.$summaryCanvas) {
                if (this.longestTrade != null) {        
                    this.$summaryCanvas.append("----- " + this.stockInfo + " with investment " + this.baseFund + " ----- </br>");
                    this.$summaryCanvas.append("----- Strategy: " + this.strategyType + " " + this.strategy.getString() + " -----</br></br>");
                    this.$summaryCanvas.append("****************** Longest Trade ******************" + "</br>");
                    this.longestTrade.output(this.$summaryCanvas);
                    this.$summaryCanvas.append("*****************************************************" + "</br>");
                }

                this.$summaryCanvas.append("historical profit: " + historicalProfit.toFixed(3) + "</br>");
                this.$summaryCanvas.append("total profit so far: " + totoalProfit.toFixed(3) + "</br>");
                this.$summaryCanvas.append("average day to make profit: " + (totoalDays / count).toFixed(3) + "</br>");
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