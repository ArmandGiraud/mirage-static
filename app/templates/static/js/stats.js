import CONFIG from './config.js';

let expeditionLineChart = null;
const expeditionColors = [];

function getRandomColor() {
    return `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`;
}

function calculateConfidenceInterval(data) {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (data.length - 1);
    const standardDeviation = Math.sqrt(variance);
    const standardError = standardDeviation / Math.sqrt(data.length);
    const marginOfError = 1.96 * standardError; // 95% confidence interval
    return { lower: mean - marginOfError, upper: mean + marginOfError };
}

function createExpeditionLineChart() {
    const lineChartContainer = document.getElementById('expeditionLineChart');

    if (!expeditionLineChart) {
        const ctx = lineChartContainer.getContext('2d');
        expeditionLineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [], // Initialize with empty labels
                datasets: []
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Expedition Point'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Rewards'
                        }
                    }
                },
                plugins: {
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                yMin: CONFIG.EXPEDITION.COST,
                                yMax: CONFIG.EXPEDITION.COST,
                                borderColor: 'red',
                                borderWidth: 2,
                                label: {
                                    content: 'Expedition Cost',
                                    enabled: true,
                                    position: 'center'
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    const datasets = CONFIG.VARIABLES.expeditions.map((expedition, index) => {
        if (!expeditionColors[index]) {
            expeditionColors[index] = getRandomColor();
        }
        return {
            label: `Expedition ${index + 1}: ${expedition.destinationName}`,
            data: expedition.rewards,
            borderColor: expeditionColors[index],
            borderWidth: 1,
            backgroundColor: 'rgba(0, 255, 0, 0.3)', // Green above the line
            tension: 0.3 // Adjust this value to control the smoothness
        };
    });

    // Find the longest dataset
    const maxLength = Math.max(...datasets.map(dataset => dataset.data.length));

    // Update the line chart data
    expeditionLineChart.data.labels = Array.from({ length: maxLength }, (_, index) => `Exp ${index + 1}`);
    expeditionLineChart.data.datasets = datasets;
    expeditionLineChart.update();
}

function createExpeditionBarChart() {
    console.log('Creating Expedition Bar Chart');

    const barChartContainer = document.getElementById('barChart');

    // Prepare the data
    const expeditions = CONFIG.VARIABLES.expeditions.map(expedition => {
        const totalRewards = expedition.rewards.reduce((a, b) => a + b, 0);
        const averageReward = totalRewards / expedition.rewards.length;
        const bounds = calculateConfidenceInterval(expedition.rewards);
        return {
            name: expedition.destinationName,
            averageReward: averageReward,
            error: {
                type: 'data',
                array: [bounds.upper - averageReward],
                arrayminus: [averageReward - bounds.lower]
            }
        };
    });

    // Sort the data by averageReward in descending order
    expeditions.sort((a, b) => a.averageReward - b.averageReward);

    // Extract sorted labels, data, and error bars
    const labels = expeditions.map(expedition => expedition.name);
    const data = expeditions.map(expedition => expedition.averageReward);
    const errorBars = expeditions.map(expedition => expedition.error);

    const trace = {
        x: data,
        y: labels,
        type: 'bar',
        orientation: 'h',
        error_x: {
            type: 'data',
            array: errorBars.map(e => e.array[0]),
            arrayminus: errorBars.map(e => e.arrayminus[0]),
            visible: true
        }
    };

    const layout = {
        title: 'Average Expedition Rewards',
        xaxis: {
            title: 'Average Rewards'
        },
        yaxis: {
            title: 'Expedition',
            tickangle: -45 // Rotate the y-axis labels by -45 degrees
        },
        autosize: false,
        margin: {
            l: 65,
            r: 30,
            b: 20,
            t: 10,
            pad: 4
        },
        width: 600,
        height: 500,
        tickmode: 'array',
    };

    Plotly.newPlot(barChartContainer, [trace], layout);
}

function debounce(func, wait, maxCallsPerSecond) {
    let timeout;
    let callCount = 0;
    let lastCallTime = 0;

    return function(...args) {
        const now = Date.now();
        if (now - lastCallTime > 1000) {
            callCount = 0;
            lastCallTime = now;
        }

        callCount++;

        if (callCount > maxCallsPerSecond) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                callCount = 0;
                func.apply(this, args);
            }, wait);
        } else {
            func.apply(this, args);
        }
    };
}

export const debouncedGenerateExpeditionGraph = debounce(generateExpeditionGraph, 1000); // Adjust the wait time as needed

export function generateExpeditionGraph() {
    createExpeditionLineChart();
    createExpeditionBarChart();
}

export function isGraphDisplayed() {
    const container = document.getElementById('expeditionGraphContainer');
    return container.style.display === 'none' || container.style.display === '';
}


export function unlockExpeditionStats() {
    const container = document.getElementById('expeditionGraphContainer');
    if (isGraphDisplayed()) {
        container.style.display = 'block';
        debouncedGenerateExpeditionGraph();
    } else {
        container.style.display = 'none';
    }
}

window.showTab = function(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.style.display = 'none';
    });
    document.getElementById(tabId).style.display = 'block';
};