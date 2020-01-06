class StockAnalyser {
/*
        vector<Price> prices;
        vector<int> peaks;
        Strategy* strategy;
        Trade* longestTrade;
        float investment;*/
    constructor(invest) {
        this.investment = invest;
        this.longestTrade = null;
        this.strategy = null;
        this.prices = [];
        this.peaks = [];
    }

    loadStrategy(_strategy) {
        this.strategy = _strategy;
    }


    /*

    
        loadData(string path) {
            ifstream file(path);
            string rowValue;
            int rowIndex = 0;
            float ppPrice = -1, pPrice = -1;
            while (file.good()) {
                getline(file, rowValue, '\n');
    
                vector<string> values = split(rowValue, ',');
                if (values.size() > 0 && rowIndex > 0) {
                    string dt = values[0];
                    float openPrice = stof(values[1]);
                    float highPrice = stof(values[2]);
                    float lowPrice = stof(values[3]);
                    float closePrice = stof(values[4]);
    
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
                            peaks.push_back((int)prices.size() - 1);
                        }
                        ppPrice = pPrice;
                        pPrice = closePrice;
                    }
    
                    prices.push_back(Price(dt, openPrice, highPrice, lowPrice, closePrice));
                }
                rowIndex++;
            }
        }*/
    
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
                    var openPrice = data[1];
                    var highPrice = data[2];
                    var lowPrice = data[3];
                    var closePrice = data[4];

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

        /*loadData(path) {
            //var self = this;
            $.ajax({
                type: "GET",
                url: "stockdata/AAPL_2019.csv",
                dataType: "text",
                context: this,
                success: function(data) {
                    processData(data);
                    document.body.innerHTML = data;
                },
                error: function(data) {
                    alert(data);
                }
            });
        } */
    
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
            var trade = null;
            var totoalProfit = 0.0;
            var historicalProfit = 0.0;
            var totoalDays = 0.0;
            var i = 0;
            var count = 0.0;

            while (i < this.prices.length) {
                trade = this.applyStrategyFromPrice(i);
                historicalProfit += Math.max(0.0, trade.getProfit());
                totoalProfit += trade.getProfit();
                if (withCompound) {
                    this.investment += trade.getProfit();
                }
                totoalDays += trade.getNumOfTradeDays();
                count++;
                trade.output();
                if (trade.getNumOfTradeDays() > maxDays) {
                    maxDays = trade.getNumOfTradeDays();
                    this.longestTrade = trade;
                }
                i = trade.getEndIndex() + 1;
            }
    
            if (this.longestTrade != null) {
                console.log("************************** Longest Trade ***************************\n");
                this.longestTrade.output();
                console.log("********************************************************************\n");
            }
    
            console.log("historical profit: " + historicalProfit);
            console.log("total profit so far: " + totoalProfit);
            console.log("average day to make profit: " + totoalDays / count)
        }
};