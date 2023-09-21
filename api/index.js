import express from "express"
import { Pool } from "pg"
import dotenv from "dotenv"

const pool = new Pool(
    connectionString = `${process.env.POSTGRES_URL}?sslmode=require`,
)

const app = express()
const server = app.listen(8585, () => {
    console.log("Server running on Port 8585.")
})

app.get("/api", (req,res))