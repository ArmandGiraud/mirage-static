import CONFIG from './config.js';
import { logEvent } from './utils.js';
import { updateUIAfterCocoCollection, updateUIAfterFishCollection } from './uiUpdates.js';

export class TradeUtils {

    static activateTrade() {
        let fishCounter = document.getElementById('nbFish');
        let nbFishes = parseInt(fishCounter.innerText);
        let cocoCounter = document.getElementById('nbCoco');
        let nbCoco = parseInt(cocoCounter.innerText)
        if (nbFishes < CONFIG.FISH.ACTIVATE_TRADE_COST) {
            return;
        }
        nbFishes -= CONFIG.FISH.ACTIVATE_TRADE_COST;
        fishCounter.innerText = nbFishes.toString();
        document.getElementById('activateTradeButton').style.display = "none";
        document.getElementById('tradeBlock').style.visibility = "visible";
        CONFIG.VARIABLES.tradeActivated = true;
        logEvent("Activated trade with Robinson. You can now trade coconuts for fish and fish for coconuts.");
        logEvent(`Next update after ${CONFIG.TRADE_NUMBER_MIN} trades.`);

        let tradeDiv = document.getElementById('allButtons');
        let multiplierDiv = document.createElement('div');
        multiplierDiv.style = "display: flex; flex-direction: column; gap: 1px;"
        multiplierDiv.appendChild(createCocoMultiplierButton(5));
        multiplierDiv.appendChild(createCocoMultiplierButton(10));
        tradeDiv?.appendChild(multiplierDiv);
        let cocoForFish = document.getElementById('tradeCocoForFishButton');
        let fishForCoco = document.getElementById('tradeFishForCocoButton');
        cocoForFish.addEventListener('click', TradeUtils.tradeCocoForFishMultiplierCallBack(1))
        fishForCoco.addEventListener('click', TradeUtils.tradeFishForCocoMultiplierCallBack(1))
        updateUIAfterFishCollection(nbFishes);
        updateUIAfterCocoCollection(nbCoco);
    }

    static tradeCocoForFish(tradeMultiplier) {
        let fishCounter = document.getElementById('nbFish');
        let cocoCounter = document.getElementById('nbCoco');
        let nbCoco = parseInt(cocoCounter.innerText)
        let nbFishes = parseInt(fishCounter.innerText);
        // check if we have enough coconuts
        if (nbCoco < CONFIG.COCO.TRADE_COST * tradeMultiplier) {
            logEvent("Not enough Coco")
            return;
        }
        console.log(tradeMultiplier)
        cocoCounter.innerText = nbCoco - CONFIG.COCO.TRADE_COST * tradeMultiplier;
        fishCounter.innerText = nbFishes + CONFIG.COCO.TRADE_REWARD * tradeMultiplier;
        CONFIG.VARIABLES.tradeCount+= tradeMultiplier;
        updateUIAfterFishCollection(fishCounter.innerText);
        updateUIAfterCocoCollection(cocoCounter.innerText);
        TradeUtils.checkUpgradesUnlock();
        logEvent("Traded coco for fish.");
    }

    static tradeFishForCoco(tradeMultiplier) {
        let fishCounter = document.getElementById('nbFish');
        let nbFishes = parseInt(fishCounter.innerText)
        // check if we have enough coconuts
        if (nbFishes < CONFIG.FISH.TRADE_COST  * tradeMultiplier) {
            logEvent("not enough fish")
            return;
        }
    
        let cocoCounter = document.getElementById('nbCoco');
        let nbCoco = parseInt(cocoCounter.innerText);
        cocoCounter.innerText = nbCoco + CONFIG.FISH.TRADE_REWARD * tradeMultiplier;
        fishCounter.innerText = nbFishes - CONFIG.FISH.TRADE_COST * tradeMultiplier;
        updateUIAfterFishCollection(fishCounter.innerText);
        updateUIAfterCocoCollection(cocoCounter.innerText);
        CONFIG.VARIABLES.tradeCount+= tradeMultiplier;
        TradeUtils.checkUpgradesUnlock();
        logEvent("Traded fish for coco.");
    }

    static tradeCocoForFishSingle() {
        return () => TradeUtils.tradeCocoForFishMultiplierCallBack(1);
    }

    static tradeFishForCocoSingle() {
        return () => TradeUtils.tradeFishForCoco(1);
    }

    static checkUpgradesUnlock() {
        const buildLadderButton = document.getElementById('buildLadderButton');
        const buildFishingRodButton = document.getElementById('buildFishingRodButton');
        const buyRespawnButton = document.getElementById('buyRespawnButton');
        const upgrade = document.getElementById('upgrade');
        const buyHireFeatureButton = document.getElementById('buyHireFeatureButton');
        const buildExpeditionShipButton = document.getElementById('buildExpeditionShipButton');
        let collectFishButton = document.getElementById('collectFishButton');
        const hireCookButton = document.getElementById('hireCookButton');
        if (collectFishButton.style.visibility === "visible" && CONFIG.VARIABLES.tradeCount >= CONFIG.TRADE_NUMBER_MIN) {
            let nbCoco = document.getElementById("nbCoco").innerText;
            buildLadderButton.style.display = 'block';
            buildFishingRodButton.style.display = 'block';
            upgrade.style.display = "inline";
            buyRespawnButton.style.display = 'block';
            buyHireFeatureButton.style.display = 'block';
            buyHireFeatureButton.disabled = nbCoco < CONFIG.HIRE.FEATURE_COST;
            buildExpeditionShipButton.style.display = 'block';
            buyHireFeatureButton.disabled = nbCoco < CONFIG.EXPEDITION.SHIP_COST;
            hireCookButton.style.display = "flex";
            logEvent(`Unlocked ladder. You can now build a ladder for ${CONFIG.VARIABLES.ladderCost} 🥥`);
            logEvent(`Unlocked Fishing Rod. You can now build a Fishing rod for ${CONFIG.FISH.ROD_COST} 🐟`);
            logEvent(`Unlocked Respawn. You can now buy a respawn for ${CONFIG.RESPAWN.COST} 🥥`);
        }
    }

    static tradeCocoForFishMultiplierCallBack(multiplier) {
        return () => TradeUtils.tradeCocoForFish(multiplier);
    }

    static tradeFishForCocoMultiplierCallBack(multiplier) {
        return () => TradeUtils.tradeFishForCoco(multiplier);
    }
}

function createCocoMultiplierButton(multiplier) {
    const multiplierButton = document.createElement('button');
    multiplierButton.id = `cocoMultiplierButton-${multiplier}`
    multiplierButton.innerText = `${multiplier}`
    multiplierButton.style = "font-size: 11px"
    multiplierButton.addEventListener('click', TradeUtils.tradeFishForCocoMultiplierCallBack(multiplier));
    CONFIG.VARIABLES.tradeButtons.push(multiplierButton);
    return multiplierButton;
}

export default TradeUtils;