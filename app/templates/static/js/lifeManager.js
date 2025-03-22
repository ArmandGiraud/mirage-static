import CONFIG from './config.js';
import { updateUIAfterCocoCollection, updateUIAfterFishCollection } from './uiUpdates.js';

class LifeManager {
    updateLife() {
        let life = document.getElementById('life').value;
        
        life = parseInt(life);
        life -= CONFIG.LIFE_DECREMENT;
        if (life < 0) {
            if (CONFIG.VARIABLES.respawnCount > 0) {
                const useRespawn = confirm("You ran out of life! Do you want to use your respawn?");
                if (useRespawn) {
                    this.respawn();
                    return;
                }
              }
            alert("You died 💀");
            life = 0;
        } if (life < document.getElementById('life').max * 0.2) {
            document.getElementById('lifeblink').style.animation = "blinkingText 1.2s infinite";
        } else {
            document.getElementById('lifeblink').style.animation = 'none';
        }
    
        document.getElementById('life').value = life;
        document.getElementById('lifeString').innerText = life.toString();
    }

    respawn() {
        let life = document.getElementById('life');
        life.value = life.max;
        document.getElementById('lifeString').innerText = life.max.toString();
        CONFIG.RESPAWN.COUNT--;
        document.getElementById('respawnCounter').innerText = `Respawn: ${CONFIG.RESPAWN.COUNT.toString()}`; 
        logEvent("You used your respawn and came back to life with full health!");
    }
    

    updateLifeWithCoco() {
        const lifeBar = document.getElementById('life');
        lifeBar.value = Math.min(lifeBar.value + CONFIG.COCO.BUY_LIFE_INCREMENT, 100);
        this.updateLife();
    }

    updateLifeWithFish() {
        const lifeBar = document.getElementById('life');
        lifeBar.value = Math.min(lifeBar.value + CONFIG.FISH.EXTRA_LIFE, 100);
        this.updateLife();
    }

    increaseLifeBar() {
        const lifeBar = document.getElementById('life');
        lifeBar.value = Math.min(lifeBar.value + CONFIG.COCO.BUY_LIFE_INCREMENT, 100);
        this.updateLife();
    }

    static eatCoconut() {
        let nbCoco = parseInt(document.getElementById('nbCoco').innerText);
        if (nbCoco > 0) {
            nbCoco--;
            document.getElementById('nbCoco').innerText = nbCoco;
            CONFIG.VARIABLES.eatenCoco++;
            this.updateLifeWithCoco();
            updateUIAfterCocoCollection(nbCoco);
        }
    }

    static eatFish() {
        let nbFish = parseInt(document.getElementById('nbFish').innerText);
        if (nbFish > 0) {
            nbFish--;
            document.getElementById('nbFish').innerText = nbFish;
            this.updateLifeWithFish();
            updateUIAfterFishCollection(nbFish);
        }
    }

    buyLife() {
        let nbCoco = parseInt(document.getElementById('nbCoco').innerText);
        if (nbCoco < CONFIG.VARIABLES.buyLifePrice) {
            logEvent(`You need at least ${CONFIG.VARIABLES.buyLifePrice} coconuts to buy more life 🥥`);
            return;
        }
        nbCoco -= CONFIG.VARIABLES.buyLifePrice;
        document.getElementById('nbCoco').innerText = nbCoco;
        increaseLifeBar();
        CONFIG.VARIABLES.buyLifePrice = Math.ceil(CONFIG.VARIABLES.buyLifePrice * CONFIG.INFLATION_FACTOR);
        updateUIAfterCocoCollection(nbCoco);
    }    
}

export default LifeManager;