var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var nunjucks = require('nunjucks');
var nodemailer = require('nodemailer');
var uuidv1 = require('uuid/v1');

// Update the below details with your own MySQL connection details
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'nodelogin'
});

var app = express();

nunjucks.configure('views', {
  autoescape: true,
  express   : app
});

app.use(session({
	secret: 'your secret key',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'static')));

// Email activation required?
var account_activation_required = false;

app.get('/', function(request, response) {
	response.render('index.html');
});

app.post('/', function(request, response) {
	// Create variables with the post data
	var username = request.body.username;
	var password = request.body.password;
	// check if the data exists and is not empty
	if (username && password) {
		// Select the account from the accounts table
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				// Account exists (username and password match)
				// Create session variables
				request.session.loggedin = true;
				request.session.username = username;
				// Redirect to home page
				response.redirect('/home');
			} else {
				response.render('index.html', { msg: 'Incorrect Username and/or Password!' });
			}
		});
	} else {
		response.render('index.html', { msg: 'Please enter Username and Password!' });
	}
});

app.get('/register', function(request, response) {
	response.render('register.html');
});

app.post('/register', function(request, response) {
	// Create variables and set to the post data
	var username = request.body.username;
	var password = request.body.password;
	var email = request.body.email;
	// Check if the post data exists and not empty
	if (username && password && email) {
		// Check if account exists already in the accounts table, checks for username but you could change this to email etc
		connection.query('SELECT * FROM accounts WHERE username = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				response.render('register.html', { msg: 'Account already exists with that username!' });
			} else if (!/\S+@\S+\.\S+/.test(email)) {
				// Make sure email is valid
				response.render('register.html', { msg: 'Invalid email address!' });
			} else if (!/[A-Za-z0-9]+/.test(username)) {
				// Username validation, must be numbers and characters
				response.render('register.html', { msg: 'Username must contain only characters and numbers!' });
			} else if (account_activation_required) {
				// Change the username and passowrd below to your email and pass, the current mail host is set to gmail but you can change that if you want.
				var transporter = nodemailer.createTransport({
		            host: 'smtp.gmail.com',
		            port: 465,
		            secure: true,
		            auth: {
		                user: 'xxxxxx@xxxxxx.xxx',
		                pass: 'xxxxxx'
		            }
		        });
				// Generate a random unique ID
				var activation_code = uuidv1();
				// Change the below domain to your domain
				var activate_link = 'http://localhost:3000/activate/' + email + '/' + activation_code;
				// Change the below mail options
		        var mailOptions = {
		            from: '"Your Name / Business name" <xxxxxx@gmail.com>',
		            to: email,
		            subject: 'Account Activation Required',
		            text: 'Please click the following link to activate your account: ' + activate_link,
		            html: '<p>Please click the following link to activate your account: <a href="' + activate_link + '">' + activate_link + '</a></p>'
		        };
				// Insert account with activation code
				connection.query('INSERT INTO accounts VALUES (NULL, ?, ?, ?, ?)', [username, password, email, activation_code], function(error, results, fields) {
					transporter.sendMail(mailOptions, function(error, info) {
			            if (error) {
			                return console.log(error);
			            }
			            console.log('Message %s sent: %s', info.messageId, info.response);
			        });
					response.render('register.html', { msg: 'You have successfully registered!' });
				});
			} else {
				// Insert account with no activation code
				connection.query('INSERT INTO accounts VALUES (NULL, ?, ?, ?, "")', [username, password, email], function(error, results, fields) {
					response.render('register.html', { msg: 'You have successfully registered!' });
				});
			}
		});
	} else {
		// Form is not complete...
		response.render('register.html', { msg: 'Please complete the registration form!' });
	}
});

app.get('/activate/:email/:code', function(request, response) {
	// Check if the email and activation code match in the database
	connection.query('SELECT * FROM accounts WHERE email = ? AND activation_code = ?', [request.params.email, request.params.code], function(error, results, fields) {
		if (results.length > 0) {
			// Email and activation exist, update the activation code to "activated"
			connection.query('UPDATE accounts SET activation_code = "activated" WHERE email = ? AND activation_code = ?', [request.params.email, request.params.code], function(error, results, fields) {
				response.send('Your account has been activated!');
				response.end();
			});
		} else {
			response.send('Incorrect email/activation code!');
			response.end();
		}
	});
});

app.get('/home', function(request, response) {
	// Check if user is logged in
	if (request.session.loggedin) {
		// Render home page
		response.render('home.html', { username: request.session.username });
	} else {
		// Redirect to login page
		response.redirect('/');
	}
});

app.get('/profile', function(request, response) {
	// Check if user is logged in
	if (request.session.loggedin) {
		// Get all the users account details so we can display them on the profile page
		connection.query('SELECT * FROM accounts WHERE username = ?', [request.session.username], function(error, results, fields) {
			// Render profile page
			response.render('profile.html', { account: results[0] });
		});
	} else {
		// Redirect to login page
		response.redirect('/');
	}
});

app.get('/logout', function(request, response) {
	// Destroy session data
	request.session.destroy();
	// Redirect to login page
	response.redirect('/');
});

// Listen on port 3000 (http://localhost:3000/)
app.listen(3000);
