const express = require("express");
const path = require("path");
const app = express();
const Database = require("@replit/database");

const db = new Database();

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/apps", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages/apps.html"));
});

app.get("/app", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages/applaunch.html"));
});
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages/about.html"));
});
app.get("/settings", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages/settings.html"));
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

const { auth } = require("express-openid-connect");

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: "5e359cb7026bbdaac53b9b00",
  baseURL: "https://flowspace.app",
  clientID: "IUBgdFi1neGP5elwtudekd8P377j68XT",
  issuerBaseURL: "https://dev-wph3886sqkyu8smt.us.auth0.com",
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router
const { requiresAuth } = require("express-openid-connect");

app.get("/user/getinfo", requiresAuth(), (req, res) => {
  user = {
    name: req.oidc.user.name,
    picture: req.oidc.user.picture,
    email: req.oidc.user.email,
    id: req.oidc.user.sid,
  };
  res.send(user);
});
