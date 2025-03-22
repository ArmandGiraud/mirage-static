import CONFIG from './config.js';

export function updateUIAfterCocoCollection(nbCoco) {
    const buildLadderButton = document.getElementById('buildLadderButton');
    document.getElementById('eatCocoButton').disabled = nbCoco < 1;
    if (nbCoco > CONFIG.COCO.LEARN_FISH_COST - 1 && document.getElementById('collectFishButton').style.visibility === 'hidden') {
        document.getElementById('learnFishButton').style.visibility = 'visible';
    }
    shouldDisableBuyLifeButton(nbCoco);
    shouldDisableTradecocoForFishButton(nbCoco);
    document.getElementById('buyRespawnButton').disabled = nbCoco < CONFIG.RESPAWN.COST;
    buildLadderButton.disabled = nbCoco < CONFIG.COCO.LADDER_COST;
    document.getElementById('hireRobinsonButton').disabled = nbCoco < CONFIG.HIRE.ROBINSON_COST;
    document.getElementById('buildLadderButton').disabled = nbCoco < CONFIG.VARIABLES.ladderCost;
    document.getElementById('buyHireFeatureButton').disabled = nbCoco < CONFIG.HIRE.FEATURE_COST;
    document.getElementById('buildExpeditionShipButton').disabled = nbCoco < CONFIG.EXPEDITION.SHIP_COST;
    document.getElementById('addNewExpedition').disabled = nbCoco < CONFIG.EXPEDITION.COST;
    document.getElementById('hireCookButton').disabled = nbCoco < CONFIG.HIRE.UNLOCK_COOK_COST;
    document.getElementById('showExpeditionGraphButton').disabled = nbCoco < CONFIG.UNLOCK_STATS_COST;
    
    CONFIG.VARIABLES.expeditions.map(expe => disableLaunchExpeditionButton(expe, nbCoco));}

function disableLaunchExpeditionButton(expedition, nbCoco) {
    let isDisabled = nbCoco < CONFIG.EXPEDITION.COST || expedition.isRunning;
    console.log(`expedition-${expedition.expeditionCount}-launchButton`)
    document.getElementById(`expedition-${expedition.expeditionCount}-launchButton`).disabled = isDisabled;
}

export function updateUIAfterFishCollection(nbFish) {
    shouldDisableTradeFishForCocoButton(nbFish);

    // Disable or enable the build fishing rod button based on the current resources
    const buildFishingRodButton = document.getElementById('buildFishingRodButton');
    buildFishingRodButton.disabled = nbFish < CONFIG.FISH.ROD_COST;
    // eat fish button
    document.getElementById('eatFishButton').disabled = nbFish < 1;
    document.getElementById('activateTradeButton').disabled = nbFish < CONFIG.FISH.ACTIVATE_TRADE_COST;

}

export function shouldDisableBuyLifeButton(nbCoco) {
    const buyLifeCoco = document.getElementById('buyLifeCoco');
    if (nbCoco >= CONFIG.VARIABLES.buyLifePrice) {
        buyLifeCoco.style.visibility = 'visible';
        buyLifeCoco.disabled = false;
    } else {
        buyLifeCoco.disabled = true;
    }
}

function shouldDisableTradeFishForCocoButton(nbFish) {
    const tradeFishForCocoButton = document.getElementById('tradeFishForCocoButton');
    tradeFishForCocoButton.disabled = nbFish < CONFIG.FISH.TRADE_COST;
}

function shouldDisableTradecocoForFishButton(nbCoco) {
    const tradeCocoForFishButton = document.getElementById('tradeCocoForFishButton');
    tradeCocoForFishButton.disabled = nbCoco < CONFIG.COCO.TRADE_COST;
}