document.addEventListener('DOMContentLoaded', () => {
    const addPlayerForm = document.getElementById('add-player-form');
    const playerNameInput = document.getElementById('player-name');
    const playersList = document.getElementById('players-list');
    const treningTableBody = document.querySelector('#trening-table tbody');
    const playerSelect = document.getElementById('player-select');
    const addTreningForm = document.getElementById('add-trening-form');

    let treningStats = []; // Ovde ćemo čuvati sve treninge
    let utakmicaStats = []; // Ovde ćemo čuvati sve utakmice

    // Učitavanje igrača iz baze podataka
    function loadPlayers() {
        fetch('/api/players')
            .then(response => response.json())
            .then(players => {
                updatePlayerList(players);
                updatePlayerSelect(players);
            })
            .catch(error => console.error('Greška prilikom učitavanja igrača:', error));
    }

    // Dodavanje igrača preko API-ja
    addPlayerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const playerName = playerNameInput.value.trim();
        if (playerName) {
            fetch('/api/players', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: playerName })
            })
            .then(response => response.json())
            .then(player => {
                alert(`Igrač ${player.name} uspešno dodat!`);
                loadPlayers();  // Osvežava listu igrača nakon dodavanja
                playerNameInput.value = '';  // Prazni input polje nakon unosa
            })
            .catch(error => {
                console.error('Greška prilikom dodavanja igrača:', error);
            });
        } else {
            alert("Molimo unesite ime igrača");
        }
    });

    // Ažuriraj listu igrača
    function updatePlayerList(players) {
        playersList.innerHTML = '';  // Očisti trenutnu listu

        players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = player.name;

            // Dugme za pregled istorije
            const viewHistoryButton = document.createElement('button');
            viewHistoryButton.textContent = 'Pogledaj Istoriju Bacanja';
            viewHistoryButton.addEventListener('click', () => {
                window.location.href = `history.html?player=${encodeURIComponent(player.name)}`;
            });

            // Dodaj dugme za brisanje igrača
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Obriši Igrača';
            deleteButton.addEventListener('click', () => {
                if (confirm(`Jeste li sigurni da želite obrisati igrača ${player.name}?`)) {
                    deletePlayer(player.id);
                }
            });

            li.appendChild(viewHistoryButton);
            li.appendChild(deleteButton);
            playersList.appendChild(li);
        });
    }

    // Ažuriraj padajući meni za izbor igrača
    function updatePlayerSelect(players) {
        playerSelect.innerHTML = '';  // Očisti trenutni sadržaj menija

        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player.id;
            option.textContent = player.name;
            playerSelect.appendChild(option);
        });
    }

    // Funkcija za brisanje igrača
    function deletePlayer(playerId) {
        fetch(`/api/players/${playerId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            alert('Igrač obrisan');
            loadPlayers();  // Osvežavanje liste igrača nakon brisanja
        })
        .catch(error => {
            console.error('Greška prilikom brisanja igrača:', error);
        });
    }

    // Učitavanje svih igrača prilikom pokretanja stranice
    loadPlayers();
});
