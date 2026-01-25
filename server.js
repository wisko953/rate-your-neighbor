const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Sert tous les fichiers statiques du dossier "public"
app.use(express.static(path.join(__dirname, "public")));

// Route optionnelle (pas obligatoire, mais clair)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`✅ Serveur lancé : http://localhost:${PORT}`);
});