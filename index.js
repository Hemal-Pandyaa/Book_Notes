//* importing
import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import env from "dotenv";
env.config();

//* constants
const app = express();
const PORT = process.env.PORT || 3000;
const booksPerPage = 10;

const db = new pg.Client({
    user: process.env.PG_USERNAME,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT
});

db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

//* routes
// Get Route
app.get("/", (req,res) => {
    res.redirect("/0");
})

app.get("/:page", async (req,res) => {  
    // splices the result to get the get all the books between 1 to 15
    const page = parseInt(req.params.page);
    
    let books;
    const info = "title,author,description,display_name,rating,total_review,TO_CHAR(last_updated, 'Mon DD YYYY') AS last_updated,cover_image_url"
    const result = await getInfoOfBook(info);
    if(result.error){

    } else {
        // Imagine page 0. // 0 * 15 = 0. // that splice to 0 to 0 + 15 which meanse 0 to 15
        const bookThisPage = page * booksPerPage;
        books = result.splice(bookThisPage, bookThisPage + booksPerPage);
    }

    let data = {
        books: books,
    }

    res.render("home.ejs", data);
})

// listening
app.listen(PORT, (req,res) => {
     (`App is running on port ${PORT}`)
})

//* Api Part
async function getInfoOfBook(info){
    const query = `SELECT ${info} FROM books INNER JOIN users ON user_id = users.id`
    const response = await db.query(query)
    if (response.error){
  
        return {error: "Something Went Wrong!"};
    }else {
        return response.rows;
    }
}