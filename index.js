const express = require('express')
const dotenv = require("dotenv");
const pg = require("pg");



dotenv.config();

const { Pool } = pg;

const pool = new Pool({
	connectionString: process.env.POSTGRES_URL,
});
const app = express();

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE"
	);
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
	);
	res.setHeader("Access-Control-Allow-Credentials", true);
	res.setHeader("Access-Control-Allow-Private-Network", true);
	res.setHeader("Access-Control-Max-Age", 7200);

	next();
});

app.get("/api/search", (req, res) => {
	const { query } = req.query;
	pool
		.query(
			`SELECT * FROM posts 
      WHERE "postTitle" ILIKE $1 OR "postText" ILIKE $1;`,
			[`%${query}%`]
		)
		.then((data) => res.json(data.rows))
		.catch((e) => {
			console.log("Error:", e);
			res.sendStatus(500);
		});
});

app.get("/api/post/:id", (req, res) => {
	const { id } = req.params;
	pool
		.query(`SELECT * FROM posts WHERE "postID"=$1`, [id])
		.then((data) => res.json(data.rows))
		.catch((e) => res.sendStatus(404));
});



app.get("/api", (req, res) =>
	pool
		.query("SELECT * FROM posts")
		.then((data) => res.json(data.rows))
		.catch((e) => res.sendStatus(500))
);



const server = app.listen(8585, () => {
	console.log("Server running on Port 8585.");
});

module.exports = app