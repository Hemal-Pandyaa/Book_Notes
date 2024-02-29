import express from "express";
import pg from "pg";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;


app.listen(PORT, (req,res) => {
    console.log(`App is running on port ${PORT}`)
})