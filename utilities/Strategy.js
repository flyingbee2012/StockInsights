class Strategy {
    constructor(strategy, k) {
        this.strategy = strategy;
        this.index = k;
    }

    hasMore() {
        return this.index < this.strategy.length;
    }

    getCurrentDropPct() {
        return strategy[k + 1];
    };

       /* 
        vector<float> strategy;
    public:
        Strategy(vector<float> _strategy) {
            k = 0;
            strategy = _strategy;
        }
    
        bool hasMore() {
            return k < strategy.size();
        };
    
        float getCurrentDropPct() {
            return strategy[k + 1];
        };
    
        int getCurrentPurchaseTimes() {
            return (int)strategy[k + 2];
        }
    
        float getCurrentSalePct() {
            return strategy[k];
        }
    
        void moveToNext() {
            k += 3;
        }
    
        void reset() {
            k = 0;
        }
    
        int getBasePurchaseAmount(float fund, float price) {
            int times = 1;
            for (unsigned int i = 2; i < strategy.size(); i += 3) {
                if (strategy[i] != FLT_MAX) {
                    times += (int)strategy[i];
                }
            }
            float share = fund / times;
            return (int)(share / price);
        }*/
};