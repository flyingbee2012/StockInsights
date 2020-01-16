// [LB, #, LB, #, ....., UB]
class LazyStrategy {
    constructor(strategy) {
        this.strategy = strategy;
        this.index = 0;
        this.type = "Lazy";
    }

    hasMore() {
        return this.index + 1 < this.strategy.length;
    }

    getCurrentDropPct() {
        return this.strategy[this.index];
    };

    getCurrentPurchaseTimes() {
        return this.strategy[this.index + 1];
    }

    getSalePct() {
        return this.strategy[this.strategy.length - 1];
    }

    moveToNext() {
        this.index += 2;
    }

    reset() {
        this.index = 0;
    }

    getBasePurchaseAmount(fund, price) {
        var times = 1;
        for (var i = 1; i < this.strategy.length; i += 2) {
            times += this.strategy[i];
        }
        var share = fund / times;
        return Math.floor(share / price);
    }

    getString() {
        return this.strategy.toString();
    }
};