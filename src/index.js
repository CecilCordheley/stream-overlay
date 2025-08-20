const express = require('express');
const path = require('path');
const fs = require('fs');
const notifier = require('node-notifier');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;

// 🔧 Référence absolue au dossier `public` à côté de l’exécutable
const publicPath = path.resolve(process.cwd(), 'public');

// Notification de démarrage
notifier.notify({
  title: 'Stream Overlay',
  message: `✅ Serveur lancé : http://localhost:${PORT}/interface`,
  sound: true
});

// Lancement navigateur
exec(`start http://localhost:${PORT}/interface`);

// Servez tous les fichiers statiques depuis public/
app.use(express.static(publicPath));

// Route /interface → charge index.html
app.get('/interface', (req, res) => {
  res.sendFile(path.join(publicPath, 'interface', 'index.html'));
});
app.use(express.json());
// --- API : sauvegarde d'un fichier JSON ---
app.post('/api/saveJson', (req, res) => {
  try {
    const { filePath, content } = req.body;

    if (!filePath || !content) {
      return res.status(400).json({ error: "filePath et content sont requis" });
    }

    // ⚠ sécurité : n’autoriser que les fichiers dans /public/data/
    const fullPath = path.join(publicPath, filePath);
    if (!fullPath.startsWith(path.join(publicPath, 'data'))) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    // Écrire le contenu
    fs.writeFileSync(fullPath, JSON.stringify(JSON.parse(content), null, 2), 'utf-8');

    res.json({ status: "ok", file: filePath });
  } catch (err) {
    res.status(500).json({ error: "Impossible de sauvegarder", details: err.message });
  }
});

// API : lecture data.json
app.get('/api/data', (req, res) => {
  const dataPath = path.join(publicPath, 'data', 'data.json');
  if (fs.existsSync(dataPath)) {
    res.json(JSON.parse(fs.readFileSync(dataPath, 'utf-8')));
  } else {
    res.json({ channel: '', streamlabelsDir: '' });
  }
});

// API : mise à jour data.json

app.post('/api/update', express.json(), (req, res) => {
  const dataPath = path.join(publicPath, 'data', 'data.json');
  fs.writeFileSync(dataPath, JSON.stringify(req.body, null, 2), 'utf-8');
  res.json({ status: 'ok' });
});
app.get('/api/getScene', (req, res) => {
  try {
     const scenesPath = path.join(publicPath, 'data', 'scenes.json');
    const data = fs.readFileSync(scenesPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Impossible de lire scenes.json' });
  }
});

// Mettre à jour la liste des scènes
app.post('/api/updateScene', (req, res) => {
  try {
    const scenesPath = path.join(publicPath, 'data', 'scenes.json');
 /*   const data = fs.readFileSync(scenesPath, 'utf-8');
    console.dir(data);*/
    const body = req.body;
    console.log(typeof body);
  /*  if (!Array.isArray(body)) {
      return res.status(400).json({ error: 'Format invalide : tableau attendu' });
    }*/
    fs.writeFileSync(scenesPath, JSON.stringify(body, null, 2));
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Impossible d’écrire scenes.json'+err,dataType:typeof body });
  }
});
const streamLabelDir = path.join(__dirname, '../public/data/streamlabelsDir'); // ou défini dynamiquement

app.get('/api/streamlabel/:key', (req, res) => {
  const key = req.params.key;
 // console.log(filePath);
  const filePath = path.join(streamLabelDir, `${key}.txt`);
  console.log(filePath);
  if (fs.existsSync(filePath)) {
    res.send(fs.readFileSync(filePath, 'utf-8'));
  } else {
    res.status(404).send('');
  }
});
// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Serveur actif sur http://localhost:${PORT}`);
});