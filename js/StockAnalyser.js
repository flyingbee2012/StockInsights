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

    // Max Drop tracking
    this.biggestDropFromPrice = 0.0;
    this.biggestDropFromPriceDate = null;
    this.biggestDropEndPrice = 0.0;
    this.biggestDropEndPriceDate = null;
    this.biggestDropDuration = 0;

    // Longest Drop tracking
    this.longestDropDuration = 0;
    this.longestDropStartPrice = 0.0;
    this.longestDropStartDate = null;
    this.longestDropEndPrice = 0.0;
    this.longestDropEndDate = null;
    this.longestDropRecoveryDate = null;

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

  // Calculate calendar days between two dates (M/D/YYYY format)
  calculateDateDifference(startDate, endDate) {
    var start = new Date(startDate);
    var end = new Date(endDate);
    var timeDifference = end.getTime() - start.getTime();
    var dayDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return dayDifference;
  }

  loadAndProcessData(prices, startYear, endYear) {
    this.startYear = startYear;
    this.endYear = endYear;

    var maxDrop = Number.MIN_SAFE_INTEGER;
    var highestPrice = Number.MIN_SAFE_INTEGER;
    var highestPriceDate = null;

    // Process all prices to find the data range first
    var validPrices = [];
    for (var i = 0; i < prices.length; i++) {
      var dt = this.getYear(prices[i].dateTime);
      if (dt >= startYear && dt <= endYear) {
        validPrices.push({ ...prices[i], originalIndex: i });
      }
    }
    this.prices = validPrices;

    // Calculate Max Drop (existing logic)
    for (var i = 0; i < this.prices.length; i++) {
      var currentPrice = this.prices[i];

      if (currentPrice.highPrice > highestPrice) {
        highestPrice = currentPrice.highPrice;
        highestPriceDate = currentPrice.dateTime;
      }

      const dropPct =
        ((highestPrice - currentPrice.lowPrice) / highestPrice) * 100;
      if (dropPct > maxDrop) {
        maxDrop = dropPct;
        this.biggestDropFromPrice = highestPrice;
        this.biggestDropFromPriceDate = highestPriceDate;
        this.biggestDropEndPrice = currentPrice.lowPrice;
        this.biggestDropEndPriceDate = currentPrice.dateTime;
        this.biggestDropDuration = this.calculateDateDifference(
          highestPriceDate,
          currentPrice.dateTime,
        );
      }
    }

    // Calculate Longest Drop using the user's algorithm
    this.findLongestDrop();
  }

  // Modified to follow Max Drop approach: use highPrice for peaks, lowPrice for valleys
  findLongestDrop() {
    var dropDurations = [];
    var i = 0;

    while (i < this.prices.length - 1) {
      var currentHigh = this.prices[i].highPrice;
      var currentDate = this.prices[i].dateTime;

      // Check if next day's low is significantly lower (drop starts)
      if (
        i + 1 < this.prices.length &&
        this.prices[i + 1].lowPrice < currentHigh
      ) {
        var dropStartIndex = i;
        var dropStartPrice = currentHigh;
        var dropStartDate = currentDate;
        var recoveryIndex = -1;

        // Look forward for recovery (highPrice >= original highPrice)
        for (var j = i + 1; j < this.prices.length; j++) {
          if (this.prices[j].highPrice >= currentHigh) {
            recoveryIndex = j;
            break;
          }
        }

        var dropDuration;
        var recoveryDate;
        var lowestPrice = currentHigh;
        var lowestDate = currentDate;

        // Find the lowest price during the drop period (using lowPrice like Max Drop)
        var endIndex =
          recoveryIndex !== -1 ? recoveryIndex : this.prices.length - 1;
        for (var k = dropStartIndex; k <= endIndex; k++) {
          if (this.prices[k].lowPrice < lowestPrice) {
            lowestPrice = this.prices[k].lowPrice;
            lowestDate = this.prices[k].dateTime;
          }
        }

        if (recoveryIndex !== -1) {
          // Recovered - calculate calendar days between start and recovery
          dropDuration = this.calculateDateDifference(
            dropStartDate,
            this.prices[recoveryIndex].dateTime,
          );
          recoveryDate = this.prices[recoveryIndex].dateTime;

          // Store this completed drop information
          dropDurations.push({
            duration: dropDuration,
            startPrice: dropStartPrice,
            startDate: dropStartDate,
            lowestPrice: lowestPrice,
            lowestDate: lowestDate,
            recoveryDate: recoveryDate,
          });

          i = recoveryIndex; // Jump to recovery point
        } else {
          // Never recovered - calculate calendar days from start to end of data
          var endDate = this.prices[this.prices.length - 1].dateTime;
          dropDuration = this.calculateDateDifference(dropStartDate, endDate);

          // Store this never-recovered drop information
          dropDurations.push({
            duration: dropDuration,
            startPrice: dropStartPrice,
            startDate: dropStartDate,
            lowestPrice: lowestPrice,
            lowestDate: lowestDate,
            recoveryDate: null, // Never recovered
          });

          i = this.prices.length; // End the loop
        }
      } else {
        // No drop, move to next point
        i++;
      }
    }

    // Find the longest drop
    var longestDrop = null;
    for (var d = 0; d < dropDurations.length; d++) {
      if (!longestDrop || dropDurations[d].duration > longestDrop.duration) {
        longestDrop = dropDurations[d];
      }
    }

    // Set longest drop properties
    if (longestDrop) {
      this.longestDropDuration = longestDrop.duration;
      this.longestDropStartPrice = longestDrop.startPrice;
      this.longestDropStartDate = longestDrop.startDate;
      this.longestDropEndPrice = longestDrop.lowestPrice;
      this.longestDropEndDate = longestDrop.lowestDate;
      this.longestDropRecoveryDate = longestDrop.recoveryDate;
    }
  }

  applyStrategyFromPrice(index) {
    var trade = new Trade(this.prices.length - 1);
    var baseAmount = this.strategy.getBasePurchaseAmount(
      this.investment,
      this.prices[index].closePrice,
    );
    var times = 1;

    var amount = baseAmount * times;

    var lowerBound = -1.0;
    var upperBound = Number.MAX_VALUE;

    trade.purchase(
      amount,
      this.prices[index].closePrice,
      this.prices[index].dateTime,
      index,
    );

    if (this.strategy.hasMore()) {
      lowerBound =
        this.prices[index].closePrice *
        (1.0 - this.strategy.getCurrentDropPct());
      upperBound =
        this.prices[index].closePrice *
        (1.0 + this.strategy.getCurrentSalePct());
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
          lowerBound =
            trade.getCostBasis() * (1.0 - this.strategy.getCurrentDropPct());
          upperBound =
            trade.getCostBasis() * (1.0 + this.strategy.getCurrentSalePct());
          times = this.strategy.getCurrentPurchaseTimes();
          amount = baseAmount * times;
          this.strategy.moveToNext();
        } else {
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
    var start = 0,
      end = pks.length - 1;
    while (start + 1 < end) {
      var mid = start + (end - start) / 2;
      if (pks[mid] > target) {
        end = mid;
      } else {
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
    trade.sellAll(
      endPrice,
      this.prices[this.prices.length - 1].dateTime,
      this.prices.length - 1,
    );
    if (this.$historyCanvas) {
      trade.output(this.$historyCanvas);
      this.$historyCanvas.append("<hr>");
    }

    this.outputSummaryData(
      this.$summaryCanvas,
      this.stockInfo,
      this.startYear,
      this.endYear,
      this.biggestDropFromPrice,
      this.biggestDropFromPriceDate,
      this.biggestDropEndPrice,
      this.biggestDropEndPriceDate,
      this.biggestDropDuration,
      this.longestDropDuration,
      this.longestDropStartPrice,
      this.longestDropStartDate,
      this.longestDropEndPrice,
      this.longestDropRecoveryDate || "Never recovered",
    );
  }

  // only applies for 2 strategies
  applyStrategyContinuously(withCompound) {
    if (
      this.strategyType != "Averaging Down Lazy" &&
      this.strategyType != "Averaging Down"
    ) {
      return;
    }

    var maxDays = -1;
    var i = 0;

    while (i < this.prices.length) {
      var trade =
        this.strategyType === "Averaging Down"
          ? this.applyStrategyFromPrice(i)
          : this.applyLazyStrategyFromPrice(i);
      if (this.$historyCanvas) {
        trade.output(this.$historyCanvas);
        this.$historyCanvas.append("<hr>");
      }
      if (trade.getNumOfTradeDays() > maxDays) {
        maxDays = trade.getNumOfTradeDays();
        this.longestTrade = trade;
      }
      i = trade.getEndIndex() + 2;
    }

    this.outputSummaryData(
      this.$summaryCanvas,
      this.stockInfo,
      this.startYear,
      this.endYear,
      this.biggestDropFromPrice,
      this.biggestDropFromPriceDate,
      this.biggestDropEndPrice,
      this.biggestDropEndPriceDate,
      this.biggestDropDuration,
      this.longestDropDuration,
      this.longestDropStartPrice,
      this.longestDropStartDate,
      this.longestDropEndPrice,
      this.longestDropRecoveryDate || "Never recovered",
    );
  }

  getDropPct(drpFromPrice, drpEndPrice) {
    var n = ((drpFromPrice - drpEndPrice) / drpFromPrice) * 100;
    n = n.toFixed(3);
    return n.toString() + "%";
  }

  outputSummaryData(
    $canvas,
    stockInfo,
    startYear,
    endYear,
    dropFromPrice,
    dropFromDate,
    dropEndPrice,
    dropEndDate,
    dropDuration,
    longestDropDuration,
    longestDropStartPrice,
    longestDropStartDate,
    longestDropEndPrice,
    longestDropRecoveryDate,
  ) {
    if ($canvas) {
      $canvas.append(
        "<center>--- <b>" +
          stockInfo +
          "</b> (" +
          startYear +
          " - " +
          endYear +
          ") ---</center><br>",
      );

      $canvas.append("<div class='separator'>Max Drop</div>");
      $canvas.append("Duration: " + dropDuration + " days<br>");
      $canvas.append(
        this.getDropPct(dropFromPrice, dropEndPrice) +
          ": " +
          getString(dropFromPrice) +
          " (" +
          dropFromDate +
          ") => " +
          getString(dropEndPrice) +
          " (" +
          dropEndDate +
          ")",
      );
      $canvas.append("<br><br>");

      $canvas.append("<div class='separator'>Longest Drop</div>");
      if (longestDropDuration > 0) {
        $canvas.append("Duration: " + longestDropDuration + " days<br>");
        $canvas.append(
          "From: " +
            getString(longestDropStartPrice) +
            " (" +
            longestDropStartDate +
            ")<br>",
        );
        var dropPct = this.getDropPct(
          longestDropStartPrice,
          longestDropEndPrice,
        );
        $canvas.append(
          "Drop: " + dropPct + " to " + getString(longestDropEndPrice) + "<br>",
        );
        $canvas.append("Recovery: " + longestDropRecoveryDate);
        if (longestDropRecoveryDate === "Never recovered") {
          $canvas.append(" (ongoing decline)");
        }
      } else {
        $canvas.append("No significant drops found in this period.");
      }
    }
  }

  // [LB, #, LB, #, ....., UB]
  applyLazyStrategyFromPrice(index) {
    var trade = new Trade(this.prices.length - 1);
    var baseAmount = this.strategy.getBasePurchaseAmount(
      this.investment,
      this.prices[index].closePrice,
    );
    var times = 1;

    var amount = baseAmount * times;
    var peakValue = this.prices[index].closePrice;
    var lowerBound = -1.0;
    var upperBound = Number.MAX_VALUE;
    var dropPct = 0;

    trade.purchase(
      amount,
      this.prices[index].closePrice,
      this.prices[index].dateTime,
      index,
    );

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
        } else {
          lowerBound = -1.0; // will make it stop from purchasing more when price drops lower next time
          upperBound =
            trade.getCostBasis() * (1.0 + this.strategy.getSalePct()); // will make it sell all stocks when price gets higher
        }
      }
      // earned profit and stop
      else if (highestPrice >= upperBound) {
        trade.sellAll(upperBound, this.prices[i].dateTime, i);
        this.strategy.reset();
        return trade;
      }

      peakValue = Math.max(peakValue, highestPrice);
      lowerBound =
        lowerBound == -1.0 ? lowerBound : peakValue * (1.0 - dropPct);
    }

    // if the price never drops below the threshold, sell all stocks at the current price at the end
    var k = this.prices.length - 1;
    trade.sellAll(this.prices[k].closePrice, this.prices[k].dateTime, k);
    this.strategy.reset();
    return trade;
  }
}
