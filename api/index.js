import express from "express";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
	connectionString: process.env.POSTGRES_URL + "?sslmode=require",
});
const app = express();

app.get("/search", (req, res) => {
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

app.get("/post/:id", (req, res) => {
	const { id } = req.params;
	pool
		.query(`SELECT * FROM posts WHERE "postID"=$1`, [id])
		.then((data) => res.json(data.rows))
		.catch((e) => res.sendStatus(404));
});



app.get("/", (req, res) =>
	pool
		.query("SELECT * FROM posts")
		.then((data) => res.json(data.rows))
		.catch((e) => res.sendStatus(500))
);

const server = app.listen(8585, () => {
	console.log("Server running on Port 8585.");
});
