//* This type of comment mean section
//? And this mean sub-section
// and this is normal comment
//! You may install Better comments Extension by Aaron Bond for highlighting

//* importing
import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import env from "dotenv";
env.config();

//* constants and config
const app = express();
const PORT = process.env.PORT || 3000;
const booksPerPage = 10;

const db = new pg.Client({
    user: process.env.PG_USERNAME,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

//* routes
//? Get Route
// This will hit up as website is loaded and will redirect to page 0
app.get("/", (req, res) => {
    res.redirect("/0?sortIn=ASC&sortBy=title");
});

// This is home page for my website
app.get("/:page", async (req, res) => {
    // retriving information
    const page = parseInt(req.params.page);
    const sortIn = req.query.sortIn;
    const sortBy = req.query.sortBy;
    const search = req.query.search;
    // splices the result to get the get all the books between 1 to 15
    let books;
    const infoRequired =
        "title,author,description,display_name,rating,category,total_review,TO_CHAR(last_updated, 'Mon DD YYYY') AS last_updated,cover_image_url";
    let result;
    console.log(sortIn && sortBy);
    console.log(sortIn);
    if (sortIn && sortBy) {
        result = await getInfoOfBook(infoRequired, sortIn, sortBy, search);
    } else {
        result = await getInfoOfBook(infoRequired);
    }
    if (result.error) {
    } else {
        // Imagine page 0. // 0 * 15 = 0. // that splice to 0 to 0 + 15 which meanse 0 to 15
        const bookThisPage = page * booksPerPage;
        books = result.slice(bookThisPage, bookThisPage + booksPerPage);
    }

    let displayable = convertToDisplayable(sortIn, sortBy);
    let data = {
        books: books,
        sortIn: sortIn,
        sortBy: sortBy,
        dSortIn: displayable.sortIn,
        dSortBy: displayable.sortBy,
        search: search,
        totalResult: result.length,
        totalAvalabilePage: (result.length / booksPerPage),
        currentPage: page,
    };

    res.render("home.ejs", data);
});

//? Post Methods
// this method will hit up for filters
app.post("/:page", async (req, res) => {
    const page = req.params.page;
    const sortIn = req.body.sortIn;
    const sortBy = req.body.sortBy;
    const search = req.body.search;
    console.log(req.body);
    res.redirect(`/${page}?sortIn=${sortIn}&sortBy=${sortBy}&search=${search}`);
});

// listening
app.listen(PORT, (req, res) => {
    console.log(`App is running on port ${PORT}`);
});

//* Api Part
async function getInfoOfBook(info, sortIn, sortBy, search) {
    if(!search){

    }
    let query;
    if (sortBy && sortIn) {
        query = `SELECT ${info} FROM books INNER JOIN users ON user_id = users.id  WHERE title ILIKE '%${search}%' ORDER BY ${sortBy} ${sortIn}`;
    } else {
        query = `SELECT ${info} FROM books INNER JOIN users ON user_id = users.id WHERE title ILIKE '%${search}%'`;
    }
    console.log(query);
    const response = await db.query(query);
    if (response.error) {
        return { error: "Something Went Wrong!" };
    } else {
        return response.rows;
    }
}

// * functions
function convertToDisplayable(sortIn, sortBy) {
    let dSortBy, dSortIn;
    switch (sortIn) {
        case "ASC":
            dSortIn = "A - Z";
            break;

        case "DESC":
            dSortIn = "Z - A";
            break;

        default:
            dSortIn = "A - Z";
    }

    switch (sortBy) {
        case "title":
            dSortBy = "Title";
            break;

        case "category":
            dSortBy = "Category";
            break;

        case "total_review":
            dSortBy = "Popular";
            break;

        case "rating":
            dSortBy = "Rating";
            break;

        case "last_updated":
            dSortBy = "Latest Updated";
            break;

        default:
            dSortIn = "A - Z";
    }
    return { sortBy: dSortBy, sortIn: dSortIn };
}
