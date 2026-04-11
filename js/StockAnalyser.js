class StockAnalyser {
  constructor(invest, stockInfo, $historyCanvas, $summaryCanvas) {
    this.baseFund = invest;
    this.investment = invest;
    this.stockInfo = stockInfo;
    this.startYear = null;
    this.endYear = null;
    this.prices = [];

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

    // Process all prices to find the data range first
    var validPrices = [];
    for (var i = 0; i < prices.length; i++) {
      var dt = this.getYear(prices[i].dateTime);
      if (dt >= startYear && dt <= endYear) {
        validPrices.push({ ...prices[i], originalIndex: i });
      }
    }
    this.prices = validPrices;

    // Calculate Max Drop
    this.findMaxDrop();
    // Calculate Longest Drop using the user's algorithm
    this.findLongestDrop();

    // Display the analysis results
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

  findMaxDrop() {
    var maxDrop = Number.MIN_SAFE_INTEGER;
    var highestPrice = Number.MIN_SAFE_INTEGER;
    var highestPriceDate = null;

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
  }

  // Modified to follow Max Drop approach: use highPrice for peaks, lowPrice for valleys
  findLongestDrop() {
    var dropDurations = [];
    var i = 0;

    while (i < this.prices.length - 1) {
      var currentHigh = this.prices[i].highPrice;
      var currentDate = this.prices[i].dateTime;

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
        i = recoveryIndex; // Jump to recovery point
      } else {
        // Never recovered - calculate calendar days from start to end of data
        var endDate = this.prices[this.prices.length - 1].dateTime;
        dropDuration = this.calculateDateDifference(dropStartDate, endDate);
        recoveryDate = null; // Never recovered
        i = this.prices.length; // End the loop
      }

      // Store drop information (consolidated from both branches)
      dropDurations.push({
        duration: dropDuration,
        startPrice: dropStartPrice,
        startDate: dropStartDate,
        lowestPrice: lowestPrice,
        lowestDate: lowestDate,
        recoveryDate: recoveryDate,
      });
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
}
