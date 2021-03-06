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

    output($container) {
        var record = this.date + " " + this.type + " " + Math.floor(this.amount) + " SHs at " + getString(this.price);
        if ($container) {
            $container.append(record);
        }
    }
};