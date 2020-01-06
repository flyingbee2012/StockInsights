class Trade {
    constructor(eind) {
        this.transactions = [];
		this.startTime = "";
		this.endTime = "";
		this.startIndex = Number.MAX_SAFE_INTEGER;
		this.endIndex = eind;
		this.costBasis = 0.0;
		this.numOfShares = 0;
		this.profit = 0.0;
        this.complete = false;
        this.historialCostBasis = {};
    }

    getStartIndex() {
		return this.startIndex;
	}

	getEndIndex() {
		return this.endIndex;
	}

	getCostBasis() {
		return this.costBasis;
	}

	getProfit() {
		return this.profit;
	}
    
    output() {
        for (var transaction of this.transactions) {
            transaction.output();
            if (transaction.getType() == "Buy") {
                console.log(" (" + this.historialCostBasis[JSON.stringify(transaction)] + ")");
                document.body.innerHTML += " (" + this.historialCostBasis[JSON.stringify(transaction)] + ")";
			}
            console.log("\n");
            document.body.innerHTML += "</br>";
		}
		console.log("cost basis\t" + this.costBasis + "\n");
		console.log("profit earned\t" + this.profit + "\n");
        console.log("num of days\t" + "(" + this.getNumOfTradeDays() + ")" + "\n\n");
        
        document.body.innerHTML += "cost basis: " + this.costBasis + "</br>";
        document.body.innerHTML += "profit earned: " + this.profit + "</br>";
        document.body.innerHTML += "num of days: " + "(" + this.getNumOfTradeDays() + ")" + "</br></br>";
    }
    

	purchase(amount, price, date, index) {
		if (this.transactions.length == 0) {
			this.startTime = date;
			this.startIndex = index;
		}
		var totalValue = this.costBasis * this.numOfShares;
		this.numOfShares += amount;
		this.costBasis = (totalValue + price * amount) / (this.numOfShares);
		this.profit -= price * amount;

		var transaction = new Transaction("Buy", price, date, amount);
        
        this.historialCostBasis[JSON.stringify(transaction)] = this.costBasis;
		this.transactions.push(transaction);
	}

	sell(amount, price, date, index) {
		this.numOfShares -= amount;
		// means sold all shares and the trade is complete
		if (this.numOfShares == 0) {
			this.endTime = date;
			this.endIndex = index;
			this.complete = true;
		}
		this.profit += price * amount;
		this.transactions.push(new Transaction("Sell", price, date, amount));
	}

	sellAll(price, date, index) {
		this.sell(this.numOfShares, price, date, index);
	}

	// means sold all shares
	getNumOfTradeDays() {
		// calculate the length of time based on start date and end date
		return this.endIndex - this.startIndex;
	}

	isComplete() {
		return complete;
    }
};
