const express = require("express");
const app = express();
const port = 3001; // Promenite broj porta po potrebi

// Hardkodirani podaci o letovima
const listaSvihRezervacijaova = [
    {
        id: 1,
        polaziste: "Beograd",
        odrediste: "London",
        datumPolaska: "2023-08-22",
        datumPovratka: "2023-08-25",
        brojOsoba: 2
    },
];

// Ruta za dobijanje svih letova
app.get("/api/letovi", (req, res) => {
    res.json(listaSvihRezervacijaova);
});

app.listen(port, () => {
    console.log(`Server je pokrenut na portu ${port}`);
});
