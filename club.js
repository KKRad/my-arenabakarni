document.addEventListener("DOMContentLoaded", () => {
    const addPlayerForm = document.getElementById("add-player-form");
    const playerNameInput = document.getElementById("player-name");
    const playersList = document.getElementById("players-list");
    const treningTableBody = document.querySelector("#trening-table tbody");
    const playerSelect = document.getElementById("player-select");
    const addTreningForm = document.getElementById("add-trening-form");

    let players = [];

    // Dodavanje igrača
    addPlayerForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const playerName = playerNameInput.value.trim();
        if (playerName) {
            fetch("http://localhost:3000/api/players", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: playerName }),
            })
                .then((response) => response.json())
                .then((data) => {
                    players.push(data.name);
                    updatePlayerList();
                    updatePlayerSelect();
                    playerNameInput.value = ""; // Očisti polje nakon dodavanja
                })
                .catch((error) =>
                    console.error("Greška pri dodavanju igrača:", error),
                );
        } else {
            alert("Molimo unesite ime igrača");
        }
    });

    // Unos treninga
    addTreningForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const selectedPlayer = playerSelect.value;
        const bacanja = parseInt(
            document.getElementById("trening-bacanja").value,
        );
        const promasaji = parseInt(
            document.getElementById("trening-promasaji").value,
        );
        const datum = document.getElementById("trening-datum").value;

        if (selectedPlayer && bacanja > 0 && promasaji >= 0) {
            fetch(
                `http://localhost:3000/api/players/${selectedPlayer}/trening`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ bacanja, promasaji, datum }),
                },
            )
                .then((response) => response.json())
                .then(() => {
                    updateTreningTable();
                })
                .catch((error) =>
                    console.error("Greška pri unosu treninga:", error),
                );
        } else {
            alert("Molimo unesite ispravne podatke");
        }
    });

    // Ažuriraj listu igrača
    function updatePlayerList() {
        playersList.innerHTML = ""; // Očisti listu
        players.forEach((player) => {
            const li = document.createElement("li");
            li.textContent = player;
            const viewHistoryButton = document.createElement("button");
            viewHistoryButton.textContent = "Pogledaj Istoriju Bacanja";
            viewHistoryButton.addEventListener("click", () => {
                window.location.href = `history.html?player=${encodeURIComponent(player)}`;
            });
            li.appendChild(viewHistoryButton);
            playersList.appendChild(li);
        });
    }

    // Ažuriraj padajući meni za izbor igrača
    function updatePlayerSelect() {
        playerSelect.innerHTML = ""; // Očisti
        players.forEach((player) => {
            const option = document.createElement("option");
            option.value = player;
            option.textContent = player;
            playerSelect.appendChild(option);
        });
    }

    // Učitavanje svih igrača sa servera
    function loadPlayers() {
        fetch("http://localhost:3000/api/players")
            .then((response) => response.json())
            .then((data) => {
                players = data.map((player) => player.name);
                updatePlayerList();
                updatePlayerSelect();
            })
            .catch((error) =>
                console.error("Greška pri učitavanju igrača:", error),
            );
    }

    // Učitavanje podataka prilikom pokretanja
    loadPlayers();
});
