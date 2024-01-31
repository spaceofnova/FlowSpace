const express = require("express");
const path = require("path");
const app = express();

// Middleware to serve static files
app.use(express.static("public"));

// Existing routes
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

app.get("/changelog", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pages/changes.html"));
});

// Auth0 configuration
const { auth } = require("express-openid-connect");

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: "5e359cb7026bbdaac53b9b00",
  baseURL: "https://flowspace.app",
  clientID: "IUBgdFi1neGP5elwtudekd8P377j68XT",
  issuerBaseURL: "https://dev-wph3886sqkyu8smt.us.auth0.com",
};

app.use(auth(config));

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

// 404 handler
app.get("*", function (req, res) {
  res.status(404).sendFile(path.join(__dirname, "public", "pages/404.html"));
});

// Start the server
app.listen(process.env.PORT || 5000)
