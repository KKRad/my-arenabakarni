const urlParams = new URLSearchParams(window.location.search);
const playerName = urlParams.get('player');
document.getElementById('player-name').textContent = playerName;

const trainingHistory = [];
const matchHistory = [];

// Učitaj istoriju treninga sa servera
function loadTrainingHistory() {
    fetch(`http://localhost:3000/api/players/${playerName}/trenings`)
        .then(response => response.json())
        .then(data => {
            trainingHistory.push(...data);
            updateTrainingTable();
        })
        .catch(error => console.error('Error fetching training history:', error));
}

function loadMatchHistory() {
    fetch(`http://localhost:3000/api/players/${playerName}/utakmicas`)
        .then(response => response.json())
        .then(data => {
            matchHistory.push(...data);
            updateMatchTable();
        })
        .catch(error => console.error('Error fetching match history:', error));
}

function updateTrainingTable() {
    const trainingTable = document.getElementById('training-history').getElementsByTagName('tbody')[0];
    trainingTable.innerHTML = '';
    trainingHistory.forEach(entry => {
        let row = trainingTable.insertRow();
        row.insertCell(0).textContent = entry.date;
        row.insertCell(1).textContent = entry.throws;
        row.insertCell(2).textContent = entry.misses;
    });
}

function updateMatchTable() {
    const matchTable = document.getElementById('match-history').getElementsByTagName('tbody')[0];
    matchTable.innerHTML = '';
    matchHistory.forEach(entry => {
        let row = matchTable.insertRow();
        row.insertCell(0).textContent = entry.date;
        row.insertCell(1).textContent = entry.throws;
        row.insertCell(2).textContent = entry.misses;
        row.insertCell(3).textContent = entry.matchPoints ? "Da" : "Ne";
    });
}

loadTrainingHistory();
loadMatchHistory();
