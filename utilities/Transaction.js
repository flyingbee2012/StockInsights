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
  
    output() {
        console.log(this.type + " " + this.amount + " stocks at " + this.price + " on " + this.date);
    }
};