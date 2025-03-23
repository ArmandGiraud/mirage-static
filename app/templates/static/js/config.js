const CONFIG = {
    INITIAL_LIFE: {
        WIDTH: 160,
        VALUE: 160,
        BUY_PRICE: 20
    },
    INFLATION_FACTOR: 1.1,
    UNLOCK_STATS_COST: 35,
    COCO: {
        INCREMENT: 10,
        PROGRESS_INTERVAL: 70,
        LEARN_FISH_COST: 10,
        BUY_LIFE_INCREMENT: 16,
        LADDER_SPEED_MULTIPLIER: 0.7,
        TRADE_COST: 2,
        TRADE_REWARD: 1
    },
    FISH: {
        INCREMENT: 10,
        PROGRESS_INTERVAL: 190,
        EXTRA_LIFE: 20,
        ROD_COST: 8,
        ROD_BONUS: 6,
        TRADE_COST: 1,
        TRADE_REWARD: 2,
        ACTIVATE_TRADE_COST: 5
    },
    HIRE: {
        FEATURE_COST: 30,
        ROBINSON_COST: 6,
        COOK_COST: 1,
        UNLOCK_COOK_COST:45,
        ROBINSON_TIME: 10,
        COOK_TIME: 10,
        IS_COOK_UNLOCKED: false
    },
    RESPAWN: {
        COST: 50
    },
    EXPEDITION: {
        SHIP_COST: 100,
        COST: 10,
        BASE_REWARD: 15
    },
    LIFE_DECREMENT: 2,
    TRADE_NUMBER_MIN: 5,
    VARIABLES: {
        tradeButtons: [],
        cocoProgressInterval: 70,
        tradeCount: 0,
        eatenCoco: 0,
        respawnCount: 0,
        isRobinsonWorking: -1,
        isCookWorking: -1,
        robinsonTimerIntervalId: null,
        cookTimerIntervalId: null,
        buyLifePrice: 20,
        ladderCost: 17,
        expeditionCount: 0,
        expeditionStatsUnlocked: false,
        expeditions: [],
        tradeActivated: false,
    }
};

export default CONFIG;