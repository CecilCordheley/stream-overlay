const express = require("express");
const fetch = require("node-fetch");
const querystring = require("querystring");

const router = express.Router();

// ⚡ Variables Twitch
const CLIENT_ID = "wb27474oevxe4alz4ffm3wcg26kef6";
const CLIENT_SECRET = "5vslgbhg1m9eebxkwcdidqlba1fp59";
const REDIRECT_URI = "http://localhost:3000/auth/twitch/callback";

// Route 1 : redirection vers Twitch
router.get("/auth/twitch", (req, res) => {
  const params = querystring.stringify({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "user:read:email"
  });

  res.redirect(`https://id.twitch.tv/oauth2/authorize?${params}`);
});

// Route 2 : callback Twitch
router.get("/auth/twitch/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Code manquant");

  try {
    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: querystring.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      // redirige vers la page de test avec le token
      res.redirect(`/twitch-test.html?token=${data.access_token}`);
    } else {
      res.status(500).json(data);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de l'échange du token");
  }
});

module.exports = router;
