const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();

// Middleware to serve static files
app.use(express.static("public"));

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.forwardemail.net', // Ensure this is correct
  port: 587, // Standard port for SMTP (or use the port recommended by Forward Email)
  secure: false, // Set to true if using port 465, otherwise false
  auth: {
      user: 'issues@flowspace.app', // Ensure this is the correct email address
      pass: 'zrbg jkpy ecus ltao' // Ensure this is the correct password
  }
});


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

// New route for handling issue report form submission
app.post('/submit-issue', (req, res) => {
    const { issueTitle, issueDesc, issueCategory } = req.body;

    transporter.sendMail({
        from: 'issues@flowspace.app', // Replace with your email
        to: 'mcrealms23@gmail.com', // Replace with the destination email
        subject: `New Issue Reported: ${issueTitle}`,
        text: `Issue Details:\nTitle: ${issueTitle}\nDescription: ${issueDesc}\nCategory: ${issueCategory}`
    }, (err, info) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error sending email' });
        } else {
            console.log('Email sent: ' + info.response);
            res.json({ message: 'Issue reported successfully!' });
        }
    });
});

// 404 handler
app.get('*', function(req, res){
  res.status(404).sendFile(path.join(__dirname, "public", "pages/404.html"));
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
