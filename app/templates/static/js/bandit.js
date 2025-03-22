import { updateUIAfterCocoCollection, updateUIAfterFishCollection, shouldDisableBuyLifeButton } from './uiUpdates.js';
import CONFIG from './config.js';
import { logEvent } from './utils.js';
import { debouncedGenerateExpeditionGraph } from './stats.js';


const Expedition = class {
    constructor(expeditionCount) { 
        this.expeditionCount = expeditionCount;
        this.destinationName = DESTINATION_NAMES.at(expeditionCount);
        this.expeditionId = this.createExpeditionId(expeditionCount);
        this.expeditionTotalReward = 0;
        this.rewards = [];
        this.averageReward = Math.random() * CONFIG.EXPEDITION.BASE_REWARD + expeditionCount; // Small bonus per new expedition
        this.standardDevReward = Math.random() * CONFIG.EXPEDITION.BASE_REWARD;
        this.isRunning = false;
        this.autoExpeditionEnabled = false;
    }

    createExpeditionId(expeditionCount) {
        return "expedition-" + expeditionCount.toString();
    }
    getExpeditionName() {
        return this.expeditionId;
    }

    getRandomBetweenRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    generateRandomReward() {
        let noise = this.getRandomBetweenRange(-this.standardDevReward, this.standardDevReward);
        return Math.max(Math.floor(this.averageReward + noise), 0);
    }
    
    addTotalReward(reward){
        this.rewards.push(reward);
        this.expeditionTotalReward += reward;
    }

    start() {
        this.isRunning = true; 
    }

    stop() {
        this.isRunning = false;
    }
    
    enableAutoExpe() {
        this.autoExpeditionEnabled = true;
    }
    
    disableAutoExpe() {
        this.autoExpeditionEnabled = false;
    }

    createElements() {
        const container = document.getElementById('progressBarContainer');
    
        const expeditionDiv = document.createElement('div');
        expeditionDiv.className = 'progress-bar';
        expeditionDiv.id = this.expeditionId;

        const destinationSpan = document.createElement('span');
        const progressText = document.createElement('span');
        const progressBar = document.createElement('progress');
        const launchExpeditionButton = document.createElement('button');
        const toggleExpeditionButton = document.createElement("button");
        const expeditionReward = document.createElement('span');
        progressBar.id = this.expeditionId + "-progressBar";
        destinationSpan.id = this.expeditionId + "-destinationSpan";
        progressText.id = this.expeditionId + "-progressText";
        launchExpeditionButton.id = this.expeditionId + "-launchButton";
        toggleExpeditionButton.id = this.expeditionId + "-toggleExpeButton";
        expeditionReward.id = this.expeditionId + "-expeditionReward";
        
        destinationSpan.innerText = this.destinationName;
        destinationSpan.style.marginRight = "5px";

        progressText.className = 'progress-text';
        progressText.innerText = '0%';
        
        progressBar.max = 100;
        progressBar.value = 0;
        progressBar.style.marginLeft = "2px";
        progressBar.style.marginRight = "3px";
        toggleExpeditionButton.style = "margin-right: 3px;";
        
        launchExpeditionButton.innerText = "Launch expedition (cost 10🥥)";
        toggleExpeditionButton.innerText = "Auto"
        launchExpeditionButton.addEventListener('click', createLaunchExpeditionCallback(this));
        toggleExpeditionButton.addEventListener('click', autoLaunchExpedition(this));
        
        launchExpeditionButton.style.marginRight = "3px";
        
        expeditionDiv.appendChild(launchExpeditionButton);
        expeditionDiv.appendChild(toggleExpeditionButton);
        expeditionDiv.appendChild(destinationSpan);
        expeditionDiv.appendChild(document.createElement("span"));
        expeditionDiv.appendChild(progressText);
        expeditionDiv.appendChild(progressBar);
        expeditionDiv.appendChild(expeditionReward);
        container.appendChild(expeditionDiv);
    }
};

function createExpedition() {
    let nbCoco = parseInt(document.getElementById('nbCoco').innerText);
    if (nbCoco < CONFIG.EXPEDITION.COST) {
        logEvent(`You need at least ${CONFIG.EXPEDITION.COST} coconuts to create an expedition 🥥`);
        return;
    }

    nbCoco -= CONFIG.EXPEDITION.COST;
    document.getElementById('nbCoco').innerText = nbCoco;
    CONFIG.VARIABLES.expeditionCount++;
    let expedition = new Expedition(CONFIG.VARIABLES.expeditionCount);
    CONFIG.VARIABLES.expeditions.push(expedition);
    expedition.createElements();
    updateUIAfterCocoCollection(nbCoco);
    if (CONFIG.VARIABLES.expeditionStatsUnlocked){
        debouncedGenerateExpeditionGraph(); // Update the graph after creating a new expedition
    }
    
}

function createLaunchExpeditionCallback(expedition) {
    return async function launchExpedition() {
        await runExpedition(expedition);

    };
}

async function runExpedition(expedition) {
    let nbCoco = parseInt(document.getElementById('nbCoco').innerText);
    if (nbCoco < CONFIG.EXPEDITION.COST) {
        logEvent(`You need at least ${CONFIG.EXPEDITION.COST} coconuts to launch an expedition 🥥`);
        return;
    }

    nbCoco -= CONFIG.EXPEDITION.COST;
    document.getElementById('nbCoco').innerText = nbCoco;
    updateUIAfterCocoCollection(nbCoco);
    const progressBar = document.getElementById(expedition.getExpeditionName() + "-progressBar");
    const progressText = document.getElementById(expedition.getExpeditionName() + "-progressText");
    const launchButton = document.getElementById(expedition.getExpeditionName() + "-launchButton");
    const expeditionReward = document.getElementById(expedition.getExpeditionName() + "-expeditionReward");
    launchButton.disabled = true;
    expedition.start();
    let progress = 0;
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            console.log("start expe loop")
            if (progress < 100) {
                launchButton.disabled = true;
                progress += 10;
                progressText.innerText = `${progress}%`;
                progressBar.value = progress;
            } else {
                console.log("generate")
                clearInterval(interval);
                progressBar.value = 0;
                progressText.innerText = `${0}%`;
                launchButton.disabled = false;
                let cocoCollected = expedition.generateRandomReward();
                expeditionReward.innerText = `Got:${cocoCollected}🥥`;
                let nbCoco = parseInt(document.getElementById("nbCoco").innerText);
                nbCoco += cocoCollected;
                document.getElementById("nbCoco").innerText = nbCoco;
                expedition.addTotalReward(cocoCollected);
                expedition.stop();
                updateUIAfterCocoCollection(nbCoco);
                debouncedGenerateExpeditionGraph();
                resolve(true);
            }
        }, 600);
    });
    
    
}

function autoLaunchExpedition(expedition){
    return async function enableAutoExpedition() {
        let autoButton = document.getElementById(expedition.expeditionId + "-toggleExpeButton");
        if(expedition.autoExpeditionEnabled){
            expedition.disableAutoExpe();
            autoButton.innerText = "Auto";
        } else {
            expedition.enableAutoExpe();
            autoButton.innerText = "stop";
            do {
                await runExpedition(expedition);
            } while (expedition.autoExpeditionEnabled);
        }
    }
}

const DESTINATION_NAMES = ["Coco Cove", "Coco Crest", "Coco Coast", "Nutty Nook", "Palm Grove", "Coco Shores", "Coconut Cay", "Nutty Inlet", "Shell Beach", "Beach Bliss", "Nutty Harbor", "Shell Shores", "Sunset Sands", "Paradise Bay", "Island Haven", "Island Oasis", "Palm Paradise", "Beach Retreat", "Paradise Cove", "Island Escape", "Sunrise Shores", "Palm Promenade", "Beach Paradise", "Paradise Point", "Tropical Haven", "Shell Sanctuary", "Sunshine Shores", "Tropical Refuge", "Tropical Treasure Island"];

export default createExpedition;