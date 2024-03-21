//* This type of comment mean section
//? And this mean sub-section
// and this is normal comment
//! You may install Better comments Extension by Aaron Bond for highlighting

//* importing
import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import bcrypt from "bcryptjs";
import env from "dotenv";
env.config();

//* constants and config
const app = express();
const PORT = process.env.PORT || 3000;
const booksPerPage = 10;
const saltRound = 10;

const db = new pg.Client({
    user: process.env.PG_USERNAME,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

db.connect();

// * MiddleWares
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: true,
        resave: true,
        cookie: {
            maxAge: 60 * 60 * 60 * 60 * 72,
        },
    })
);
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

//* routes

//? Get Route

// This is home page for my website
app.get("/", async (req, res) => {
    // retriving information
    const page = parseInt(req.query.page) || 0;
    const sortIn = req.query.sortIn || "ASC";
    const sortBy = req.query.sortBy || "title";
    const search = req.query.search;
    // splices the result to get the get all the books between 1 to 15
    let books;
    const infoRequired =
        "title,author,description,display_name,rating,category,total_review,TO_CHAR(last_updated, 'Mon DD YYYY') AS last_updated,cover_image_url";
    let result;
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
        totalAvalabilePage: result.length / booksPerPage,
        currentPage: page,
        
    };
    if(req.isAuthenticated()){
        console.log("Authenticated : True")
        if(req.user.profileImage == null){
            data["profileImage"] = "Not avalabile";
            data["message"] = {
                message: "Seems Like You Haven't Completed Your Profile Yet. Complete it now to be ready to publish your own notes!",
                button: "Complete Now!"
            }
        }else{
            data["profileImage"] = "https://image.lexica.art/full_jpg/6d7832e4-07ed-47d1-b248-55f8c0c959a5";
        }
    };

    res.render("home.ejs", data);
});

app.get("/signUp", async (req, res) => {
    res.render("newUser.ejs", { task: "Sign Up" });
});

app.get("/login", async (req, res) => {
    res.render("newUser.ejs", { task: "Login" });
});

app.get("/failed", async (req, res) => {
    res.send("Login Failed");
});

//? Post Methods
// this method will hit up for filters
app.post("/", async (req, res) => {
    const page = req.query.page;
    const sortIn = req.body.sortIn;
    const sortBy = req.body.sortBy;
    const search = req.body.search;
    res.redirect(
        `/?page=${page}&sortIn=${sortIn}&sortBy=${sortBy}&search=${search}`
    );
});

app.post(
    "/auth/local",
    passport.authenticate("signUp-local", {
        successRedirect: "/",
        failureRedirect: "/failed",
    })
);

// listening
app.listen(PORT, (req, res) => {
    console.log(`App is running on port ${PORT}`);
});

//* Api Part
async function getInfoOfBook(info, sortIn, sortBy, search) {
    if (!search) {
        search = "";
    }
    let query;
    if (sortBy && sortIn) {
        query = `SELECT ${info} FROM books INNER JOIN users ON user_id = users.id  WHERE title ILIKE '%${search}%' ORDER BY ${sortBy} ${sortIn}`;
    } else {
        query = `SELECT ${info} FROM books INNER JOIN users ON user_id = users.id WHERE title ILIKE '%${search}%'`;
    }
    query;
    const response = await db.query(query);
    if (response.error) {
        return { error: "Something Went Wrong!" };
    } else {
        return response.rows;
    }
}


async function addNewUser(email,password){
    try{
        const query = "INSERT INTO users (email,password) VALUES ($1, $2) RETURNING *"
        var  user = await db.query(query, [email,password])
        user = user.rows[0];
    } catch (err){
        console.log(err)
        return {error: "Something Went Wrong!", user:false}
    }
    return {error: null, user: user}
    
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

// * Stratergies
passport.use(
    "signUp-local",
    new Strategy(
        { passwordField: "password", 
        usernameField: "email" },

        async function (email, password, cb) {
            let hashedPassword = await bcrypt.hash(password, saltRound)
            const response = await addNewUser(email,hashedPassword);
            cb(response.error,response.user)
        }
    )
);

passport.serializeUser((user,cb) => {
    return cb(null,user)
});

passport.deserializeUser((user,cb) => {
    return cb(null,user)
});