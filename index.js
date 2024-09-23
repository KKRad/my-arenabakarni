const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

// Kreiraj Express aplikaciju
const app = express();
app.use(bodyParser.json());
app.use(cors());  // Omogućava Cross-Origin Resource Sharing (CORS)

// Povezivanje na SQLite bazu (kreira bazu ako ne postoji)
const db = new sqlite3.Database('./club_stats.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Kreiraj tabelu igrača ako ne postoji
db.run(`CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    treningBroj INTEGER DEFAULT 0,
    prosjekBacanja REAL DEFAULT 0,
    prosjekPromasaja REAL DEFAULT 0,
    utakmicaBroj INTEGER DEFAULT 0,
    prosjekBacanjaUtakmica REAL DEFAULT 0,
    prosjekPromasajaUtakmica REAL DEFAULT 0
)`, (err) => {
    if (err) {
        console.error('Error creating table:', err.message);
    }
});

// Ruta za dodavanje igrača sa validacijom
app.post('/api/players', (req, res) => {
    const { name } = req.body;

    console.log("Primljen zahtjev za dodavanje igrača:", req.body);

    if (!name || name.trim() === "") {
        console.error("Greška: Ime je prazno ili nije uneto.");
        return res.status(400).json({ error: 'Name is required and cannot be empty' });
    }

    const sql = `INSERT INTO players (name) VALUES (?)`;
    db.run(sql, [name], function(err) {
        if (err) {
            console.error("Greška prilikom unosa u bazu:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log("Igrač uspešno dodat sa ID-jem:", this.lastID);
        res.status(201).json({ id: this.lastID, name });
    });
});

// Ruta za preuzimanje svih igrača
app.get('/api/players', (req, res) => {
    const sql = `SELECT * FROM players`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Ruta za ažuriranje statistika treninga za igrača
app.post('/api/players/:id/trening', (req, res) => {
    const { bacanja, promasaji } = req.body;
    const playerId = req.params.id;

    if (typeof bacanja !== 'number' || typeof promasaji !== 'number') {
        return res.status(400).json({ error: 'Bacanja and Promasaji must be numbers' });
    }

    // Preuzmi trenutne podatke igrača
    db.get(`SELECT * FROM players WHERE id = ?`, [playerId], (err, player) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }

        // Izračunaj novi prosek
        const noviTreningBroj = player.treningBroj + 1;
        const noviProsjekBacanja = ((player.prosjekBacanja * player.treningBroj) + bacanja) / noviTreningBroj;
        const noviProsjekPromasaja = ((player.prosjekPromasaja * player.treningBroj) + promasaji) / noviTreningBroj;

        // Ažuriraj statistike igrača
        const sqlUpdate = `UPDATE players 
                           SET treningBroj = ?, prosjekBacanja = ?, prosjekPromasaja = ? 
                           WHERE id = ?`;
        db.run(sqlUpdate, [noviTreningBroj, noviProsjekBacanja, noviProsjekPromasaja, playerId], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: playerId, treningBroj: noviTreningBroj, prosjekBacanja: noviProsjekBacanja, prosjekPromasaja: noviProsjekPromasaja });
        });
    });
});

// Ruta za ažuriranje statistika utakmica za igrača
app.post('/api/players/:id/utakmica', (req, res) => {
    const { bacanja, promasaji } = req.body;
    const playerId = req.params.id;

    if (typeof bacanja !== 'number' || typeof promasaji !== 'number') {
        return res.status(400).json({ error: 'Bacanja and Promasaji must be numbers' });
    }

    // Preuzmi trenutne podatke igrača
    db.get(`SELECT * FROM players WHERE id = ?`, [playerId], (err, player) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }

        // Izračunaj novi prosek za utakmice
        const noviUtakmicaBroj = player.utakmicaBroj + 1;
        const noviProsjekBacanjaUtakmica = ((player.prosjekBacanjaUtakmica * player.utakmicaBroj) + bacanja) / noviUtakmicaBroj;
        const noviProsjekPromasajaUtakmica = ((player.prosjekPromasajaUtakmica * player.utakmicaBroj) + promasaji) / noviUtakmicaBroj;

        // Ažuriraj statistike igrača za utakmice
        const sqlUpdate = `UPDATE players 
                           SET utakmicaBroj = ?, prosjekBacanjaUtakmica = ?, prosjekPromasajaUtakmica = ? 
                           WHERE id = ?`;
        db.run(sqlUpdate, [noviUtakmicaBroj, noviProsjekBacanjaUtakmica, noviProsjekPromasajaUtakmica, playerId], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: playerId, utakmicaBroj: noviUtakmicaBroj, prosjekBacanjaUtakmica: noviProsjekBacanjaUtakmica, prosjekPromasajaUtakmica: noviProsjekPromasajaUtakmica });
        });
    });
});

// Ruta za brisanje igrača
app.delete('/api/players/:id', (req, res) => {
    const playerId = req.params.id;
    const sqlDelete = `DELETE FROM players WHERE id = ?`;
    db.run(sqlDelete, playerId, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.json({ message: 'Player deleted successfully' });
    });
});

// Pokretanje servera
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
