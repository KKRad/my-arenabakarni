const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());

// CORS postavke: omogucavanje pristupa sa svih domena ili specificnih domena
const corsOptions = {
    origin: "*", // ili možete koristiti 'https://www.kkrad.com'
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions)); // Omogućava Cross-Origin Resource Sharing (CORS)

// Povezivanje na SQLite bazu (kreira bazu ako ne postoji)
const db = new sqlite3.Database("./club_stats.db", (err) => {
    if (err) {
        console.error("Greška prilikom povezivanja sa bazom:", err.message);
    } else {
        console.log("Povezano na SQLite bazu podataka.");
    }
});

// Kreiranje tabele igrača ako ne postoji
db.run(
    `
    CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    treningBroj INTEGER DEFAULT 0,
    prosjekBacanja REAL DEFAULT 0,
    prosjekPromasaja REAL DEFAULT 0,
    utakmicaBroj INTEGER DEFAULT 0,
    prosjekBacanjaUtakmica REAL DEFAULT 0,
    prosjekPromasajaUtakmica REAL DEFAULT 0
)`,
    (err) => {
        if (err) {
            console.error("Greška prilikom kreiranja tabele:", err.message);
        }
    },
);

// Dodavanje igrača sa validacijom
app.post("/api/players", (req, res) => {
    const { name } = req.body;
    if (!name || name.trim() === "") {
        return res
            .status(400)
            .json({ error: "Ime je obavezno i ne može biti prazno" });
    }
    const sql = `INSERT INTO players (name) VALUES (?)`;
    db.run(sql, [name], function (err) {
        if (err) {
            console.error("Greška prilikom unosa u bazu:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, name });
    });
});

// Preuzimanje svih igrača
app.get("/api/players", (req, res) => {
    const sql = `SELECT * FROM players`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Ažuriranje statistika treninga za igrača
app.post("/api/players/:id/trening", (req, res) => {
    const { bacanja, promasaji } = req.body;
    const playerId = req.params.id;

    if (
        typeof bacanja !== "number" ||
        (typeof promasaji !== "number" && promasaji !== 0)
    ) {
        return res
            .status(400)
            .json({ error: "Bacanja i Promašaji moraju biti brojevi" });
    }

    db.get(`SELECT * FROM players WHERE id = ?`, [playerId], (err, player) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!player) {
            return res.status(404).json({ error: "Igrač nije pronađen" });
        }

        const noviTreningBroj = player.treningBroj + 1;
        const noviProsjekBacanja =
            (player.prosjekBacanja * player.treningBroj + bacanja) /
            noviTreningBroj;
        const noviProsjekPromasaja =
            (player.prosjekPromasaja * player.treningBroj + promasaji) /
            noviTreningBroj;

        const sqlUpdate = `UPDATE players 
                           SET treningBroj = ?, prosjekBacanja = ?, prosjekPromasaja = ? 
                           WHERE id = ?`;
        db.run(
            sqlUpdate,
            [
                noviTreningBroj,
                noviProsjekBacanja,
                noviProsjekPromasaja,
                playerId,
            ],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({
                    id: playerId,
                    treningBroj: noviTreningBroj,
                    prosjekBacanja: noviProsjekBacanja,
                    prosjekPromasaja: noviProsjekPromasaja,
                });
            },
        );
    });
});

// Ažuriranje statistika utakmica za igrača
app.post("/api/players/:id/utakmica", (req, res) => {
    const { bacanja, promasaji } = req.body;
    const playerId = req.params.id;

    if (
        typeof bacanja !== "number" ||
        (typeof promasaji !== "number" && promasaji !== 0)
    ) {
        return res
            .status(400)
            .json({ error: "Bacanja i Promašaji moraju biti brojevi" });
    }

    db.get(`SELECT * FROM players WHERE id = ?`, [playerId], (err, player) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!player) {
            return res.status(404).json({ error: "Igrač nije pronađen" });
        }

        const noviUtakmicaBroj = player.utakmicaBroj + 1;
        const noviProsjekBacanjaUtakmica =
            (player.prosjekBacanjaUtakmica * player.utakmicaBroj + bacanja) /
            noviUtakmicaBroj;
        const noviProsjekPromasajaUtakmica =
            (player.prosjekPromasajaUtakmica * player.utakmicaBroj +
                promasaji) /
            noviUtakmicaBroj;

        const sqlUpdate = `UPDATE players 
                           SET utakmicaBroj = ?, prosjekBacanjaUtakmica = ?, prosjekPromasajaUtakmica = ? 
                           WHERE id = ?`;
        db.run(
            sqlUpdate,
            [
                noviUtakmicaBroj,
                noviProsjekBacanjaUtakmica,
                noviProsjekPromasajaUtakmica,
                playerId,
            ],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({
                    id: playerId,
                    utakmicaBroj: noviUtakmicaBroj,
                    prosjekBacanjaUtakmica: noviProsjekBacanjaUtakmica,
                    prosjekPromasajaUtakmica: noviProsjekPromasajaUtakmica,
                });
            },
        );
    });
});

// Brisanje igrača
app.delete("/api/players/:id", (req, res) => {
    const playerId = req.params.id;
    const sqlDelete = `DELETE FROM players WHERE id = ?`;
    db.run(sqlDelete, playerId, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Igrač nije pronađen" });
        }
        res.json({ message: "Igrač uspešno obrisan" });
    });
});

// Pokretanje servera
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server pokrenut na portu ${port}`);
});
