
import createExpedition  from './bandit.js'
import CONFIG from './config.js';
import { updateUIAfterCocoCollection, updateUIAfterFishCollection, shouldDisableBuyLifeButton } from './uiUpdates.js';
import LifeManager from './lifeManager.js';
import TradeUtils from './trade.js';
import { logEvent } from './utils.js';
import { unlockExpeditionStats } from './stats.js';

let robinsonTimerIntervalId;
let cookTimerIntervalId;
let lifeManager = new LifeManager();
setInterval(lifeManager.updateLife, 1000);


document.addEventListener('DOMContentLoaded', (event) => {
    initializeGame();
});


function initializeGame() {
    hideElements(['collectFishButton', 'learnFishButton', 'buyLifeCoco',
         'tradeBlock', 'fright']);
    document.getElementById('life').style.width = `${CONFIG.INITIAL_LIFE.WIDTH}px`;
    logEvent("On your way to your vacations, your plane crashed on a deserted Island, now you must survive!");
    logEvent("Game started. Collect coconuts to increase your life bar.");
}

function hideElements(elementIds) {
    elementIds.forEach(id => {
        document.getElementById(id).style.visibility = 'hidden';
    });
}

async function collectCoco() {
    const collectButton = document.getElementById('collectCocoButton');
    collectButton.disabled = true; // Disable the button
    await progressCoco();
    const data = { counter: parseInt(document.getElementById('nbCoco').innerText) + 1 };
    updateCocoCount(data.counter);
    collectButton.disabled = false;
    updateUIAfterCocoCollection(data.counter);
}

function updateCocoCount(nbCoco) {
    document.getElementById('nbCoco').innerText = nbCoco;
}

function progressCoco() {
    return new Promise((resolve) => {
        let progress = 0;
        const progressBar = document.getElementById('cocoProgress');
        const cocoSpan = document.getElementById('cocoSpan');
        cocoSpan.style.visibility = 'visible';
        const interval = setInterval(() => {
            progress += CONFIG.COCO.INCREMENT;
            progressBar.value = progress;
            if (progress >= 100) {
                clearInterval(interval);
                cocoSpan.style.visibility = 'hidden';
                progressBar.value = 0;
                resolve();
            }
        }, CONFIG.COCO.PROGRESS_INTERVAL);
    });
}


function eatCoconut() {
    let life = document.getElementById('life').value;
    life = parseInt(life);
    let nbCoco = parseInt(document.getElementById('nbCoco').innerText);
    if (nbCoco > 0) {
        document.getElementById('life').value = life + updateLifeWithCoco(nbCoco);
        document.getElementById('lifeString').innerText = Math.round(document.getElementById('life').value).toString();
        logEvent(`Ate a 🥥. Life increased by ${updateLifeWithCoco(nbCoco)}. Total cocos: ${nbCoco}`);
        nbCoco -= 1;
        document.getElementById('nbCoco').innerText = nbCoco.toString();
    } 
    if (nbCoco == 0) {
        document.getElementById('eatCocoButton').disabled = true;
    }
    shouldDisableBuyLifeButton(nbCoco);
    CONFIG.VARIABLES.eatenCoco++;
    if (CONFIG.VARIABLES.eatenCoco == 1) {
        logEvent(`Next update when you have ${CONFIG.COCO.LEARN_FISH_COST}🥥 in stock`);
    }
    updateUIAfterCocoCollection(nbCoco);
}

function updateLifeWithCoco(nbCoco) {
    return 10;
}

function updateLifeWithFish(nbFish) {
    return CONFIG.FISH.EXTRA_LIFE;
}

function learnToFish() {
    let nbcoco = parseInt(document.getElementById('nbCoco').innerText);
    if (nbcoco < CONFIG.COCO.LEARN_FISH_COST) {
        logEvent(`You need at least ${CONFIG.COCO.LEARN_FISH_COST} coconuts to learn how to fish 🥥`);
        return;
    }
    nbcoco -= CONFIG.COCO.LEARN_FISH_COST;
    document.getElementById('nbCoco').innerText = nbcoco;
    shouldDisableBuyLifeButton(nbcoco);
    const fishElements = document.querySelectorAll('.fishElement');
    fishElements.forEach(element => {
        console.log(element);
        element.style.display = 'block';
    });
    let learnFishButton = document.getElementById('learnFishButton');
    learnFishButton.style.visibility = 'hidden';
    let collectFishButton = document.getElementById('collectFishButton');
    collectFishButton.style.visibility = 'visible';
    updateUIAfterFishCollection(0);
    logEvent(`Learned to fish. You can now collect fish, next Update when you have ${CONFIG.FISH.ACTIVATE_TRADE_COST}🐟 in stock`);
}

async function collectFish() {
    const collectButton = document.getElementById('collectFishButton');

    collectButton.disabled = true; // Disable the button

    await progressFish(CONFIG.FISH.PROGRESS_INTERVAL);
    let nbFish = parseInt(document.getElementById('nbFish').innerText);
    nbFish++
    document.getElementById('nbFish').innerText = nbFish;
    collectButton.disabled = false;
    if(nbFish > CONFIG.FISH.ACTIVATE_TRADE_COST-1 &&
        CONFIG.VARIABLES.tradeActivated === false) {
        document.getElementById('activateTradeButton').style.display = 'block';
    }
    updateUIAfterFishCollection(nbFish);
}

function progressFish(intervalTime) {
    return new Promise((resolve) => {
        let progress = 0;
        const progressBar = document.getElementById('fishProgress');
        const fishSpan = document.getElementById('fishSpan');
        fishSpan.style.visibility = 'visible';
        const interval = setInterval(() => {
            progress += CONFIG.FISH.INCREMENT;
            progressBar.value = progress;
            if (progress >= 100) {
                clearInterval(interval);
                fishSpan.style.visibility = 'hidden';
                progressBar.value = 0;
                resolve(true);
            }
        }, intervalTime);
    });
}

function eatFish() {
    let life = document.getElementById('life').value;
    life = parseInt(life);
    let nbfish = parseInt(document.getElementById('nbFish').innerText);
    if (nbfish > 0) {
        document.getElementById('life').value = life + updateLifeWithFish(nbfish);
        document.getElementById('lifeString').innerText = Math.round(document.getElementById('life').value).toString();
        nbfish -= 1;
        document.getElementById('nbFish').innerText = nbfish.toString();
        logEvent(`Ate a 🐟. Life increased by ${updateLifeWithFish(nbfish)}. Total fish: ${nbfish}`);
    }
    updateUIAfterFishCollection(nbfish);
}

function increaseLifeBar() {
    let life = document.getElementById('life');
    let lifeBarSize = life.style.width;
    life.max = parseFloat(life.max) + CONFIG.COCO.BUY_LIFE_INCREMENT;
    life.value = life.value + CONFIG.COCO.BUY_LIFE_INCREMENT;
    let newLifebarSize  = parseFloat(lifeBarSize) + CONFIG.COCO.BUY_LIFE_INCREMENT;
    document.getElementById('life').style.width = newLifebarSize.toString() + "px";
}

function buyLife() {
    let nbcoco = parseInt(document.getElementById('nbCoco').innerText);
    if (nbcoco < CONFIG.VARIABLES.buyLifePrice) {
        return;
    }
    nbcoco -= CONFIG.VARIABLES.buyLifePrice;
    document.getElementById('nbCoco').innerText = nbcoco;
    CONFIG.VARIABLES.buyLifePrice = Math.round(CONFIG.VARIABLES.buyLifePrice * CONFIG.INFLATION_FACTOR);
    buyLifeCoco = document.getElementById('buyLifeCoco');
    buyLifeCoco.innerText = `Buy more life bar (Price ${Math.round(CONFIG.VARIABLES.buyLifePrice)} 🥥)`;
    increaseLifeBar();
    shouldDisableBuyLifeButton(nbcoco);
    if (CONFIG.VARIABLES.buyLifePrice > nbcoco) {
        buyLifeCoco.disabled = true;
    }
    let lifeMax = document.getElementById('life').max    
    logEvent(`Bought more life bar for ${CONFIG.VARIABLES.buyLifePrice}. Total life is now: ${parseFloat(lifeMax)} new price is ${CONFIG.VARIABLES.buyLifePrice}`);
}

function buildLadder() {
    let nbCoco = parseInt(document.getElementById('nbCoco').innerText);
    if (nbCoco < CONFIG.VARIABLES.ladderCost) {
        return;
    }

    nbCoco -= CONFIG.VARIABLES.ladderCost;
    document.getElementById('nbCoco').innerText = nbCoco;
    document.getElementById('collectCocoButton').innerText+= '🪜';
    let buildLadderButton = document.getElementById('buildLadderButton')
    logEvent("Built a coconut ladder. Coconut collection is now 30% faster.");
    CONFIG.VARIABLES.cocoProgressInterval = Math.round(CONFIG.VARIABLES.cocoProgressInterval * CONFIG.COCO.LADDER_SPEED_MULTIPLIER);
    CONFIG.VARIABLES.ladderCost = Math.round(CONFIG.VARIABLES.ladderCost* CONFIG.INFLATION_FACTOR);
    buildLadderButton.innerText = `Build Coconut Ladder (time to collect -30%) (Cost ${CONFIG.VARIABLES.ladderCost}🥥)`
    buildLadderButton.disabled = nbCoco < CONFIG.VARIABLES.ladderCost;
    updateUIAfterCocoCollection(nbCoco);
}

function buildFishingRod() {
    let nbFish = parseInt(document.getElementById('nbFish').innerText);
    if (nbFish < CONFIG.FISH.ROD_COST) {
        return;
    }

    nbFish -= CONFIG.FISH.ROD_COST;
    document.getElementById('nbFish').innerText = nbFish;

    document.getElementById('collectFishButton').innerText+= '🎣';
    buildFishingRodButton = document.getElementById('buildFishingRodButton')
    logEvent(`Built a fishing rod. Eating Fish give now ${CONFIG.FISH.ROD_BONUS} extra life points.`);
    CONFIG.FISH.EXTRA_LIFE+=CONFIG.FISH.ROD_BONUS; 
    CONFIG.FISH.ROD_COST = Math.round(CONFIG.FISH.ROD_COST * CONFIG.INFLATION_FACTOR);
    buildFishingRodButton.innerText = `Build Fishing Rod (Life restored +${CONFIG.FISH.ROD_BONUS}) (Cost ${CONFIG.FISH.ROD_COST}🐟)`
    buildFishingRodButton.disabled = nbFish < CONFIG.FISH.ROD_COST; // Disable the button if not enough resources
    updateUIAfterFishCollection(nbFish);
}

function resetGame() {
    document.getElementById('life').value = INITIAL_LIFE_VALUE;
    document.getElementById('lifeString').innerText = INITIAL_LIFE_VALUE.toString();
    document.getElementById('nbCoco').innerText = "0";
    document.getElementById('nbFish').innerText = "0";
    document.getElementById('collectFishButton').style.visibility = 'hidden';
    document.getElementById('learnFishButton').style.visibility = 'hidden';
    document.getElementById('buyLifeCoco').style.visibility = 'hidden';
    document.getElementById('life').style.width = `${INITIAL_LIFE_WIDTH}px`;
    CONFIG.VARIABLES.buyLifePrice = INITIAL_BUY_LIFE_PRICE;
}


function buyRespawn() {
    let nbCoco = parseInt(document.getElementById('nbCoco').innerText);
    if (nbCoco < CONFIG.RESPAWN.COST) {
        logEvent(`You need at least ${CONFIG.RESPAWN.COST} coconuts to buy a respawn 🥥`);
        return;
    }
    nbCoco -= CONFIG.RESPAWN.COST;
    CONFIG.RESPAWN.COST = Math.round(CONFIG.RESPAWN.COST * CONFIG.INFLATION_FACTOR);
    document.getElementById('nbCoco').innerText = nbCoco;
    CONFIG.VARIABLES.respawnCount++;
    document.getElementById('buyRespawnButton').innerText = `Buy Respawn (Cost ${CONFIG.RESPAWN.COST} 🥥)`;
    logEvent(`Bought a respawn for ${CONFIG.RESPAWN.COST} coconuts. You can now respawn if you run out of life.`);
    document.getElementById('respawnCounter').innerText = `Respawn: ${CONFIG.VARIABLES.respawnCount.toString()}`;
    document.getElementById('respawnCounter').style.visibility = 'visible';
    updateUIAfterCocoCollection(nbCoco);
}

function respawn() {
    let life = document.getElementById('life');
    life.value = CONFIG.INITIAL_LIFE.VALUE;
    document.getElementById('lifeString').innerText = INITIAL_LIFE_VALUE.toString();
    respawnCount--;
    document.getElementById('respawnCounter').innerText = `Respawn: ${respawnCount.toString()}`; 
    logEvent("You used your respawn and came back to life with full health!");
}

function buyHireFeature() {
    let nbCoco = parseInt(document.getElementById('nbCoco').innerText);

    if (nbCoco < CONFIG.HIRE.FEATURE_COST) {
        logEvent(`You need at least ${CONFIG.HIRE.FEATURE_COST} coconuts to buy the hire feature 🥥`);
        return;
    }
    nbCoco -= CONFIG.HIRE.FEATURE_COST;
    document.getElementById('nbCoco').innerText = nbCoco;
    document.getElementById('buyHireFeatureButton').style.display = 'none';
    document.getElementById('hireRobinsonButton').style.display = 'block';
    logEvent(`Bought the hire feature for ${CONFIG.HIRE.FEATURE_COST} coconuts. You can now hire Robinson.`);
    updateUIAfterCocoCollection(nbCoco);
}

async function hireRobinson() {
    let nbCoco = parseInt(document.getElementById('nbCoco').innerText);
    if (nbCoco < CONFIG.HIRE.ROBINSON_COST && CONFIG.VARIABLES.isRobinsonWorking == -1) {
        logEvent("Not enough coconuts to hire Robinson.");
        return;
    }
    if (CONFIG.VARIABLES.isRobinsonWorking == 1) {
        // Fire robinson on second click
        logEvent("Firing robinson!");
        fireRobinson();
        clearInterval(robinsonTimerIntervalId);
        return;
    }
    // 1 when robinson works otherwise -1
    CONFIG.VARIABLES.isRobinsonWorking = CONFIG.VARIABLES.isRobinsonWorking * -1;

    document.getElementById('nbCoco').innerText = nbCoco - CONFIG.HIRE.ROBINSON_COST;
    updateUIAfterCocoCollection(document.getElementById('nbCoco').innerText);
    document.getElementById('hireRobinsonButton').innerText = "Fire Robinson";
    document.getElementById('robinsonTimer').style.visibility = 'visible';
    logEvent("Hired Robinson. He will collect fish for you.");

    startRobinsonTimer();
    while (CONFIG.VARIABLES.isRobinsonWorking == 1) {
        nbCoco = parseInt(document.getElementById('nbCoco').innerText);
        console.log(CONFIG.VARIABLES.isRobinsonWorking);
        await collectFish();
        nbCoco = parseInt(document.getElementById('nbCoco').innerText);
        if (CONFIG.VARIABLES.isRobinsonWorking == -1) {
            return;
        }
    }
}

function startRobinsonTimer() {
    console.log('Robinson timer started');
    const robinsonTimer = document.getElementById('robinsonTimer');
    robinsonTimer.style.visibility = 'visible';
    let seconds = CONFIG.HIRE.ROBINSON_TIME;
    robinsonTimerIntervalId = setInterval(() => {
        seconds--;
        const minutes = Math.floor(seconds / 60);
        const displaySeconds = seconds % 60;
        robinsonTimer.innerText = `${String(minutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`;
        if (seconds <= 0) {
            let nbCoco = parseInt(document.getElementById('nbCoco').innerText);
            if (nbCoco < CONFIG.HIRE.ROBINSON_COST) {
                logEvent("Robinson was not payed, he stops woking");                
                fireRobinson()
                clearInterval(robinsonTimerIntervalId);
                return;
            }
            rehireRobinson();
            seconds = CONFIG.HIRE.ROBINSON_TIME;
        }
    }, 1000);
}

function fireRobinson() {
    document.getElementById('robinsonTimer').style.visibility = 'hidden';
    CONFIG.VARIABLES.isRobinsonWorking = CONFIG.VARIABLES.isRobinsonWorking * -1
    document.getElementById('hireRobinsonButton').innerText = `Hire Robinson (Cost ${CONFIG.HIRE.ROBINSON_COST} 🥥/10 sec)`
}

function rehireRobinson() {

    let nbCoco = parseInt(document.getElementById('nbCoco').innerText);
    document.getElementById('nbCoco').innerText = nbCoco - CONFIG.HIRE.ROBINSON_COST;
    updateUIAfterCocoCollection(document.getElementById('nbCoco').innerText);
    logEvent(`Paid Robinson ${CONFIG.HIRE.ROBINSON_COST} coconuts.`);
}

function buildExpeditionShip() {
    let nbCoco = parseInt(document.getElementById('nbCoco').innerText);

    if (nbCoco < CONFIG.EXPEDITION.SHIP_COST) {
        logEvent(`You need at least ${CONFIG.EXPEDITION.SHIP_COST} coconuts to build an expedition ship 🥥`);
        return;
    }

    nbCoco -= CONFIG.EXPEDITION.SHIP_COST;
    document.getElementById('nbCoco').innerText = nbCoco;
    document.getElementById('buildExpeditionShipButton').style.display = 'none';
    document.getElementById('fright').style.visibility = 'visible';
    logEvent(`Built an expedition ship for ${CONFIG.EXPEDITION.SHIP_COST} coconuts. You can now embark on expeditions.`);
    updateUIAfterCocoCollection(nbCoco);
}


async function hireCook() {
    let nbCoco = parseInt(document.getElementById('nbCoco').innerText);
    if (nbCoco < CONFIG.HIRE.UNLOCK_COOK_COST && CONFIG.VARIABLES.isCookWorking == -1) {
        logEvent("Not enough coconuts to hire a cook.");
        return;
    }
    if (CONFIG.VARIABLES.isCookWorking == 1) {
        // Fire cook on second click
        logEvent("Firing the cook!");
        fireCook();
        clearInterval(cookTimerIntervalId);
        return;
    }
    // 1 when cook works otherwise -1
    CONFIG.VARIABLES.isCookWorking = CONFIG.VARIABLES.isCookWorking * -1;
    if (!CONFIG.HIRE.IS_COOK_UNLOCKED){
        document.getElementById('nbCoco').innerText = nbCoco - CONFIG.HIRE.UNLOCK_COOK_COST;
        CONFIG.HIRE.IS_COOK_UNLOCKED = !CONFIG.HIRE.IS_COOK_UNLOCKED;
    }
    updateUIAfterCocoCollection(document.getElementById('nbCoco').innerText);
    document.getElementById('hireCookButton').innerText = "Fire Cook";
    document.getElementById('cookTimer').style.visibility = 'visible';
    logEvent("Hired a cook for 1 coco/10 seconds. He will automatically make you eat a fish if available.");
    let life = document.getElementById("life");

    startCookTimer();
    while (CONFIG.VARIABLES.isCookWorking == 1) {
        let nbFish = parseInt(document.getElementById('nbFish').innerText);
        let isHungry = life.max - life.value > CONFIG.FISH.EXTRA_LIFE + 2;
        if (nbFish > 0 && isHungry) {
            eatFish();
        }
        await new Promise(resolve => setTimeout(resolve, CONFIG.HIRE.COOK_INTERVAL));
        if (CONFIG.VARIABLES.isCookWorking == -1) {
            return;
        }
    }
}

function startCookTimer() {
    console.log('Cook timer started');
    const cookTimer = document.getElementById('cookTimer');
    cookTimer.style.visibility = 'visible';
    let seconds = CONFIG.HIRE.COOK_TIME;
    cookTimerIntervalId = setInterval(() => {
        seconds--;
        const minutes = Math.floor(seconds / 60);
        const displaySeconds = seconds % 60;
        cookTimer.innerText = `${String(minutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`;
        if (seconds <= 0) {
            let nbCoco = parseInt(document.getElementById('nbCoco').innerText);
            if (nbCoco < CONFIG.HIRE.COOK_COST) {
                logEvent("Cook was not paid, he stops working");
                fireCook();
                clearInterval(cookTimerIntervalId);
                return;
            }
            rehireCook();
            seconds = CONFIG.HIRE.COOK_TIME;
        }
    }, 1000);
}

function fireCook() {
    document.getElementById('cookTimer').style.visibility = 'hidden';
    CONFIG.VARIABLES.isCookWorking = CONFIG.VARIABLES.isCookWorking * -1;
    document.getElementById('hireCookButton').innerText = `Hire Cook (Cost ${CONFIG.HIRE.COOK_COST} 🥥/10 sec)`;
}

function rehireCook() {
    let nbCoco = parseInt(document.getElementById('nbCoco').innerText);
    document.getElementById('nbCoco').innerText = nbCoco - CONFIG.HIRE.COOK_COST;
    updateUIAfterCocoCollection(document.getElementById('nbCoco').innerText);
    logEvent(`Paid Cook ${CONFIG.HIRE.COOK_COST} coconuts.`);
}


// Attach the functions to the window object to make them globally accessible
window.hireCook = hireCook;
window.collectCoco = collectCoco;
window.collectFish = collectFish;
window.learnToFish = learnToFish;
window.eatCoconut = eatCoconut;
window.eatFish = eatFish;
window.activateTrade = TradeUtils.activateTrade;
window.buyLife = buyLife;
window.buildLadder = buildLadder;
window.buildFishingRod = buildFishingRod;
window.buyRespawn = buyRespawn;
window.hireRobinson = hireRobinson;
window.createExpedition = createExpedition;
window.buyHireFeature = buyHireFeature;
window.buildExpeditionShip = buildExpeditionShip;
window.unlockExpeditionStats = unlockExpeditionStats;

export {
    initializeGame,
    hideElements,
    logEvent,
    collectCoco,
    updateCocoCount,
    updateUIAfterCocoCollection,
    shouldDisableBuyLifeButton,
    progressCoco,
    eatCoconut,
    updateLifeWithCoco,
    updateLifeWithFish,
    learnToFish,
    collectFish,
    progressFish,
    eatFish,
    increaseLifeBar,
    buyLife,
    TradeUtils,
    buildLadder,
    buildFishingRod,
    resetGame,
    buyRespawn,
    hireRobinson,
    fireRobinson,
    startRobinsonTimer,
    rehireRobinson
};