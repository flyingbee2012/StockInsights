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
  
    output() {
        console.log(this.type + " " + this.amount + " stocks at " +  this.getPriceString() + " on " + this.date);
        document.body.innerHTML += this.type + " " + this.amount + " stocks at " + this.getPriceString() + " on " + this.date;
    }
};