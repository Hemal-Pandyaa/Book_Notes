// importing
import express from "express";
import pg from "pg";
import bodyParser from "body-parser";

// constants
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));


// routes
app.get("/", async (req,res) => {
    res.render("index.ejs");
})

// listening
app.listen(PORT, (req,res) => {
    console.log(`App is running on port ${PORT}`)
})