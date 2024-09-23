const urlParams = new URLSearchParams(window.location.search);
const playerName = urlParams.get('player');
document.getElementById('player-name').textContent = playerName;

// Mock podaci za istoriju treninga i utakmica
const trainingHistory = [
    { date: '2024-09-01', throws: 50, misses: 5 },
    { date: '2024-09-05', throws: 45, misses: 7 },
];

const matchHistory = [
    { date: '2024-09-10', throws: 40, misses: 3, matchPoints: true },
    { date: '2024-09-15', throws: 42, misses: 2, matchPoints: false },
];

// Popunjava tabelu istorije treninga
function loadTrainingHistory() {
    const trainingTable = document.getElementById('training-history').getElementsByTagName('tbody')[0];
    trainingTable.innerHTML = "";

    trainingHistory.forEach(entry => {
        let row = trainingTable.insertRow();
        row.insertCell(0).textContent = entry.date;
        row.insertCell(1).textContent = entry.throws;
        row.insertCell(2).textContent = entry.misses;
    });
}

// Popunjava tabelu istorije utakmica
function loadMatchHistory() {
    const matchTable = document.getElementById('match-history').getElementsByTagName('tbody')[0];
    matchTable.innerHTML = "";

    matchHistory.forEach(entry => {
        let row = matchTable.insertRow();
        row.insertCell(0).textContent = entry.date;
        row.insertCell(1).textContent = entry.throws;
        row.insertCell(2).textContent = entry.misses;
        row.insertCell(3).textContent = entry.matchPoints ? "Da" : "Ne";
    });
}

// Kreira grafikon napretka igrača koristeći Chart.js
function loadProgressChart() {
    const ctx = document.getElementById('progress-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: trainingHistory.map(entry => entry.date),
            datasets: [
                {
                    label: 'Treninzi',
                    data: trainingHistory.map(entry => entry.throws),
                    borderColor: 'blue',
                    fill: false,
                },
                {
                    label: 'Utakmice',
                    data: matchHistory.map(entry => entry.throws),
                    borderColor: 'green',
                    fill: false,
                },
                {
                    label: 'Promašaji',
                    data: trainingHistory.map(entry => entry.misses),
                    borderColor: 'red',
                    fill: false,
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 60
                }
            }
        }
    });
}

// Učitaj podatke pri pokretanju
loadTrainingHistory();
loadMatchHistory();
loadProgressChart();

