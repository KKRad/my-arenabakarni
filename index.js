const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

// Kreiranje aplikacije
const app = express();
app.use(bodyParser.json());

// Povezivanje sa Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// CORS postavke: omogucavanje pristupa sa svih domena ili specificnih domena
const corsOptions = {
    origin: "*", // ili možete koristiti specifične domene 'https://www.kkrad.com'
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions)); // Omogućava Cross-Origin Resource Sharing (CORS)

// Dodavanje igrača sa Supabase
app.post("/api/players", async (req, res) => {
    const { name } = req.body;
    if (!name || name.trim() === "") {
        return res.status(400).json({ error: "Ime je obavezno i ne može biti prazno" });
    }

    const { data, error } = await supabase
        .from('players')
        .insert([{ name }]);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
});

// Preuzimanje svih igrača
app.get("/api/players", async (req, res) => {
    const { data, error } = await supabase
        .from('players')
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

// Ažuriranje statistika treninga za igrača
app.post("/api/players/:id/trening", async (req, res) => {
    const { bacanja, promasaji } = req.body;
    const playerId = req.params.id;

    const { data: player, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();

    if (error || !player) {
        return res.status(404).json({ error: "Igrač nije pronađen" });
    }

    const noviTreningBroj = player.treningBroj + 1;
    const noviProsjekBacanja =
        (player.prosjekBacanja * player.treningBroj + bacanja) / noviTreningBroj;
    const noviProsjekPromasaja =
        (player.prosjekPromasaja * player.treningBroj + promasaji) / noviTreningBroj;

    const { error: updateError } = await supabase
        .from('players')
        .update({
            treningBroj: noviTreningBroj,
            prosjekBacanja: noviProsjekBacanja,
            prosjekPromasaja: noviProsjekPromasaja
        })
        .eq('id', playerId);

    if (updateError) {
        return res.status(500).json({ error: updateError.message });
    }

    res.json({
        id: playerId,
        treningBroj: noviTreningBroj,
        prosjekBacanja: noviProsjekBacanja,
        prosjekPromasaja: noviProsjekPromasaja
    });
});

// Ažuriranje statistika utakmica za igrača
app.post("/api/players/:id/utakmica", async (req, res) => {
    const { bacanja, promasaji } = req.body;
    const playerId = req.params.id;

    const { data: player, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();

    if (error || !player) {
        return res.status(404).json({ error: "Igrač nije pronađen" });
    }

    const noviUtakmicaBroj = player.utakmicaBroj + 1;
    const noviProsjekBacanjaUtakmica =
        (player.prosjekBacanjaUtakmica * player.utakmicaBroj + bacanja) / noviUtakmicaBroj;
    const noviProsjekPromasajaUtakmica =
        (player.prosjekPromasajaUtakmica * player.utakmicaBroj + promasaji) / noviUtakmicaBroj;

    const { error: updateError } = await supabase
        .from('players')
        .update({
            utakmicaBroj: noviUtakmicaBroj,
            prosjekBacanjaUtakmica: noviProsjekBacanjaUtakmica,
            prosjekPromasajaUtakmica: noviProsjekPromasajaUtakmica
        })
        .eq('id', playerId);

    if (updateError) {
        return res.status(500).json({ error: updateError.message });
    }

    res.json({
        id: playerId,
        utakmicaBroj: noviUtakmicaBroj,
        prosjekBacanjaUtakmica: noviProsjekBacanjaUtakmica,
        prosjekPromasajaUtakmica: noviProsjekPromasajaUtakmica
    });
});

// Brisanje igrača i svih njegovih statistika (treninga i utakmica)
app.delete("/api/players/:id", async (req, res) => {
    const playerId = req.params.id;

    const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Igrač uspešno obrisan" });
});

// Pokretanje servera
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server pokrenut na portu ${port}`);
});
