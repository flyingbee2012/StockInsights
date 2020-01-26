class Transaction {
    constructor(_type, _price, _date, _amount) {
        this.type = _type;
        this.price = _price;
        this.date = _date;
        this.amount = _amount;
    }

    getType() {
        return this.type;
    }

    getPriceString() {
        return Number(this.price.toFixed(3)).toString();
    }

    output($container) {
        var record = this.date + " " + this.type + " " + Math.floor(this.amount) + " stocks at " + this.getPriceString();
        if ($container) {
            $container.append(record);
        }
    }
};