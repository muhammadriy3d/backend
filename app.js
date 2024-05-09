const path = require('path');
const express = require('express');
const session = require('express-session');
const EventEmitter = require("events");
const valid = require('./src/helpers/validation');
const log = require('./src/helpers/logger');

const app = express();
const eventEmitter = new EventEmitter();

app.engine("html", require("ejs").renderFile);
app.use(express.json());
app.use(express.static(path.join(__dirname, './public/static')));
app.use(express.urlencoded({ extended: true }));
app.use(
	session({
		secret: "secret",
		resave: true,
		saveUninitialized: true,
	})
);


const users = [
	{ id: 1, username: 'Muhammad', password: 'mysupersecretpassword' },
	{ id: 2, username: 'Ahmad', password: 'hackitifyoucan' },
	{ id: 3, username: 'Saleh', password: 'passwordispassword' }
];

let visit = 0;

eventEmitter.on("rootVisit", (data) => {
	const count = data.visited + 1;
	visit = count;
	log(`Connection on '/' total visits is ${count}`);
});

app.get('/', (req, res) => {

	const response = {
		visited: visit,
		name: req.session.username
	}
	eventEmitter.emit("rootVisit", response);

	if (!req.session.loggedin) return res.redirect("/login");
	const name = req.session.username;
	res.render(path.join(__dirname, './public/index.html'), { name: name, response: `Hi there! ${name}` });
});


app.post("/", (req, res) => {
	if (!req.session.loggedin) return res.redirect("/login");
	else if (req.body.msg === "Hi")
		return res.render(path.join(__dirname, "./public/index.html"), {
			name: req.session.username,
			response: "Nice to see you!",
		});
	res.render(path.join(__dirname, "./public/index.html"), {
		name: req.session.username,
		response: "I didn't understand!",
	});
});


app.get('/api/users', (req, res) => {
	res.send(users);
	res.end();
});


app.get('/api/users/:id', (req, res) => {
	const user = users.find(u => u.id === parseInt(req.params.id));
	if (!user) return res.status(404).send('404! The user with the given ID was not found!')
	res.send(user)
	res.end();
});


app.get('/login', (req, res) => {
	if (req.session.loggedin) return res.redirect('/');
	res.render(path.join(__dirname, './src/pages/login.html'));
});


app.post('/login', (req, res) => {
	if (!req.session.loggedin) {
		const username = req.body.username;
		const password = req.body.password;
		const { error } = valid(username, password);

		if (error) return res.status(400).send(error.details[0].message)
		const user = {
			id: users.length + 1,
			username: username,
			password: password
		};
		users.push(user)

		req.session.loggedin = true;
		req.session.username = username;

		res.redirect("/")
		res.end()
	} else {
		res.redirect("/");
		res.end()
	}
});


const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}`));
app.on("connection", () => {
	console.log("New connection accepted!");
});
