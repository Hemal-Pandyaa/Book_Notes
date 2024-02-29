import app from "express";
import pg from "pg";
import bodyParser from "body-parser";

const app = app();


app.listen(PORT, (req,res) => {
    console.log(`App is running on port ${PORT}`)
})