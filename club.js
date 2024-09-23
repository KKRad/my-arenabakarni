document.addEventListener('DOMContentLoaded', () => {
    const addPlayerForm = document.getElementById('add-player-form');
    const playerNameInput = document.getElementById('player-name');
    const playersList = document.getElementById('players-list');
    const treningTableBody = document.querySelector('#trening-table tbody');
    const playerSelect = document.getElementById('player-select');
    const addTreningForm = document.getElementById('add-trening-form');

    let players = [];
    let treningStats = []; // Ovde ćemo čuvati sve treninge
    let utakmicaStats = []; // Ovde ćemo čuvati sve utakmice

    // Dodavanje igrača
    addPlayerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const playerName = playerNameInput.value.trim();
        if (playerName) {
            players.push(playerName);
            updatePlayerList();
            updatePlayerSelect();
            playerNameInput.value = ''; // Clear input field after adding player
        } else {
            alert("Molimo unesite ime igrača");
        }
    });

    // Unos treninga
    addTreningForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const selectedPlayer = playerSelect.value;
        const bacanja = parseInt(document.getElementById('trening-bacanja').value);
        const promasaji = parseInt(document.getElementById('trening-promasaji').value);
        const datum = document.getElementById('trening-datum').value;

        if (selectedPlayer && bacanja > 0 && promasaji >= 0) {
            treningStats.push({ player: selectedPlayer, bacanja, promasaji, datum });
            saveToLocalStorage(); // Čuvamo podatke u localStorage
            updateTreningTable();
        }
    });

    // Ažuriraj listu igrača
    function updatePlayerList() {
        playersList.innerHTML = ''; // Clear existing list
        players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = player;
            const viewHistoryButton = document.createElement('button');
            viewHistoryButton.textContent = 'Pogledaj Istoriju Bacanja';
            viewHistoryButton.addEventListener('click', () => {
                window.location.href = `history.html?player=${encodeURIComponent(player)}`;
            });
            li.appendChild(viewHistoryButton);
            playersList.appendChild(li);
        });
    }

    // Ažuriraj padajući meni za izbor igrača
    function updatePlayerSelect() {
        playerSelect.innerHTML = ''; // Clear existing options
        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            playerSelect.appendChild(option);
        });
    }

    // Ažuriraj tabelu treninga
    function updateTreningTable() {
        treningTableBody.innerHTML = ''; // Clear existing table
        players.forEach(player => {
            const stats = treningStats.filter(stat => stat.player === player);
            const brojTreninga = stats.length;
            const prosjekBacanja = stats.reduce((total, stat) => total + stat.bacanja, 0) / brojTreninga || 0;
            const prosjekPromasaja = stats.reduce((total, stat) => total + stat.promasaji, 0) / brojTreninga || 0;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${player}</td>
                <td>${brojTreninga}</td>
                <td>${prosjekBacanja.toFixed(2)}</td>
                <td>${prosjekPromasaja.toFixed(2)}</td>
            `;
            treningTableBody.appendChild(row);
        });
    }

    // Čuvanje podataka o treninzima u localStorage
    function saveToLocalStorage() {
        localStorage.setItem('treningStats', JSON.stringify(treningStats));
        localStorage.setItem('utakmicaStats', JSON.stringify(utakmicaStats));
    }

    // Učitavanje podataka iz localStorage
    function loadFromLocalStorage() {
        const storedTreningStats = JSON.parse(localStorage.getItem('treningStats'));
        const storedUtakmicaStats = JSON.parse(localStorage.getItem('utakmicaStats'));
        if (storedTreningStats) {
            treningStats = storedTreningStats;
        }
        if (storedUtakmicaStats) {
            utakmicaStats = storedUtakmicaStats;
        }
    }

    // Inicijalno učitavanje podataka
    loadFromLocalStorage();
    updateTreningTable();
});
