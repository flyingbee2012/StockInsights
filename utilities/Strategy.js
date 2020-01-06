class Strategy {
    constructor(strategy) {
        this.strategy = strategy;
        this.index = 0;
    }

    hasMore() {
        return this.index < this.strategy.length;
    }

    getCurrentDropPct() {
        return this.strategy[this.index + 1];
    };

    getCurrentPurchaseTimes() {
        return this.strategy[this.index + 2];
    }

    getCurrentSalePct() {
        return this.strategy[this.index];
    }

    moveToNext() {
        this.index += 3;
    }

    reset() {
        this.index = 0;
    }

    getBasePurchaseAmount(fund, price) {
        var times = 1;
        for (var i = 2; i < this.strategy.length; i += 3) {
            if (this.strategy[i] != Number.MAX_VALUE) {
                times += this.strategy[i];
            }
        }
        var share = fund / times;
        return Math.floor(share / price);
    }
};