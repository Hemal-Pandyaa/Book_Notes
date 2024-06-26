//* This type of comment mean section
//? And this mean sub-section
// and this is normal comment
//! You may install Better comments Extension by Aaron Bond for highlighting
// TODO: Make website responseive. After completing /me page
// TODO: Image change feature

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
import cookieParser from "cookie-parser";
import favicon from "serve-favicon";
import path from "path";
import { fileURLToPath } from "url";

env.config();

//* constants and config
const app = express();
const PORT = process.env.PORT || 3000;
const booksPerPage = 10;
const saltRound = 10;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(favicon(path.join(__dirname, "favicon.ico")));

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
app.use(cookieParser());

//* Variables
let cachedBooks = [];
let chachedFilters = [];
let cachedLength = null;

//* routes

//? Get Route

// This is home page for my website
app.get("/", async (req, res) => {
    // retriving information
    const page = parseInt(req.query.page) || 0;
    const sortIn = req.query.sortIn || "ASC";
    const sortBy = req.query.sortBy || "title";
    const search = req.query.search;

    const currentFilter = [sortIn, sortBy, search];
    let books;
    let length;
    const bothAreEqual =
        JSON.stringify(chachedFilters) === JSON.stringify(currentFilter);
    if (bothAreEqual && cachedBooks != []) {
        books = cachedBooks;
        length = cachedLength;
    } else {
        // splices the result to get the get all the books between 1 to 15

        const infoRequired =
            "books.id,title,author,description,display_name,rating,category,total_review,TO_CHAR(last_updated, 'Mon DD YYYY') AS last_updated,cover_image_url";
        let result;
        if (sortIn && sortBy) {
            result = await getInfoOfBook(infoRequired, sortIn, sortBy, search);
        } else {
            result = await getInfoOfBook(infoRequired);
        }
        books = result;
        cachedBooks = books;
        length = result.length;
        cachedLength = length;
        chachedFilters = currentFilter;
    }
    // Imagine page 0. // 0 * 15 = 0. // that splice to 0 to 0 + 15 which meanse 0 to 15
    const bookThisPage = page * booksPerPage;
    books = books.slice(bookThisPage, bookThisPage + booksPerPage);

    let displayable = convertToDisplayable(sortIn, sortBy);
    let data = {
        books: books,
        sortIn: sortIn,
        sortBy: sortBy,
        dSortIn: displayable.sortIn,
        dSortBy: displayable.sortBy,
        search: search,
        totalResult: length,
        totalAvalabilePage: length / booksPerPage,
        currentPage: page,
    };
    if (req.isAuthenticated()) {
        console.log("Authenticated : True");
        if (
            req.user.display_picture == "null" ||
            req.user.display_picture == null
        ) {
            data["profileImage"] = "Not avalabile";
        } else {
            data["profileImage"] = req.user.display_picture;
        }
        const notified = req.cookies.notified;
        if (!req.user.complete_profile && !notified) {
            data["message"] = {
                message:
                    "Seems Like You Haven't Completed Your Profile Yet. Complete it now to be ready to publish your own notes!",
                button: "Complete Now!",
                redirect: "/me",
            };
            res.cookie("notified", true, {
                maxAge: 1000 * 60 * 60 * 5,
                secure: true,
                httpOnly: true,
            });
        }
    }
    res.render("home.ejs", data);
});

app.get("/signUp", async (req, res) => {
    res.render("newUser.ejs", { task: "Sign-up" });
});

app.get("/login", async (req, res) => {
    res.render("newUser.ejs", { task: "Login" });
});

app.get("/failed", async (req, res) => {
    res.send("Login Failed");
});

app.get(
    "/auth/callback",
    passport.authenticate("google-strategy", {
        successRedirect: "/",
        failureRedirect: "/failed",
    })
);

app.get("/me", (req, res) => {
    if (req.isAuthenticated()) {
        if (!req.user.display_name) {
            res.render("display_name.ejs");
            return;
        }
        const dateString = "2024-04-01T18:30:00.000Z";
        const date = new Date(dateString);

        const options = { year: "numeric", month: "long", day: "numeric" };
        const formattedDate = date.toLocaleDateString("en-US", options);

        res.render("profile.ejs", {
            user: req.user,
            formattedDate: formattedDate,
        });
    } else {
        res.redirect("/login");
    }
});

app.post("/book", async (req, res) => {
    if (req.isAuthenticated()) {
        if(req.body.rating && req.body.comment){
            await postComment(req.body.rating, req.body.comment, req.user.id, req.body.book_id)
        }
        let data = {};
        data["profileImage"] = req.user.display_picture;
        const book_id = req.body.book_id;
        console.log(book_id);
        data["id"] = book_id;
        const book_data = await getBookData(book_id);
        if(req.body.chapter){
            console.log(book_data.chapterData)
            data["note"] = book_data.chapterData[req.body.chapter].chapter_note
        }
        data["book"] = book_data;

        // console.log(book_data);
        res.render("read_book.ejs", data);
    } else {
        res.redirect("/login");
    }
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

app.post("/me", async (req, res) => {
    if (req.isAuthenticated()) {
        const newUser = await updateDisplayName(
            req.body.display_name,
            req.user.email
        );
        req.user.display_name = newUser.display_name;
        console.log(newUser);
        res.redirect("/me");
    } else {
        res.redirect("/login");
    }
});

app.post("/updateField", async (req, res) => {
    if (req.isAuthenticated()) {
        const FieldValue = {};
        Object.entries(req.body).forEach(([Field, value]) => {
            FieldValue[Field] = value;
        });
        console.log(FieldValue);
        updateField(FieldValue, req.user.id);
        req.logout((e) => {
            console.log(e);
        });
        res.redirect("/me");
    } else {
        res.redirect("/");
    }
});

app.post(
    "/auth/local/Sign-up",
    passport.authenticate("signUp-local", {
        successRedirect: "/",
        failureRedirect: "/failed",
    })
);

app.post(
    "/auth/local/Login",
    passport.authenticate("login-local", {
        successRedirect: "/",
        failureRedirect: "/failed",
    })
);

app.post(
    "/auth/google/",
    passport.authenticate(`google-strategy`, {
        scope: ["profile", "email"],
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

async function addNewUser(email, password, fName, lName, d_picture) {
    try {
        let query;
        if (d_picture == null) {
            query = `INSERT INTO users (email,password, fName, lName, complete_profile) VALUES ($1, $2, $3, $4, FALSE) RETURNING *`;
        } else {
            query = `INSERT INTO users (email,password, fName, lName, display_picture, complete_profile) VALUES ($1, $2, $3, $4, '${d_picture}', FALSE) RETURNING *`;
        }
        var user = await db.query(query, [email, password, fName, lName]);
        user = user.rows[0];
    } catch (err) {
        console.log(err);
        return { error: "Something Went Wrong!", user: false };
    }
    return { error: null, user: user };
}

async function userExist(email) {
    try {
        const query = "Select email FROM users WHERE email=$1";
        var user = await db.query(query, [email]);
        if (user.rows.length === 0) {
            return false;
        } else {
            return true;
        }
    } catch {
        return false;
    }
}

async function getUser(email) {
    try {
        const query = "SELECT * FROM users WHERE email = $1";
        var user = await db.query(query, [email]);
        return user.rows[0];
    } catch {
        console.log("Something went wrong!");
        return null;
    }
}

async function updateDisplayName(display_name, email) {
    try {
        const query =
            "UPDATE users SET display_name = $1 WHERE email = $2 RETURNING *";
        const response = await db.query(query, [display_name, email]);
        return response.rows[0];
    } catch (error) {
        console.log(error, "Something went wrong!");
        return null;
    }
}

async function updateField(FieldValue, id) {
    try {
        let values = [];
        let query = "UPDATE users SET ";

        let i = 1;
        Object.entries(FieldValue).forEach(([Field, value]) => {
            const string = `${Field} = $${i++},`;
            query = query.concat(string);
            values.push(value);
        });
        query = query.slice(0, -1);
        query = query.concat(` WHERE id = $${i} RETURNING *`);
        values.push(id);
        const response = await db.query(query, values);
        return response;
    } catch (error) {
        console.log(error);
        console.log("Something went wrong!");
        return "Something went wrong!";
    }
}

/**
 *
 * @param {Number} id to identify the book
 * @returns {object }all comments chapters and creater and all about book
 */
async function getBookData(id) {
    try {
        const bookQuery =
            "SELECT display_name, title,author, isbn, rating, description, date_created, last_updated, cover_image_url, author_image_url, category, total_review \
            \
            FROM books \
            JOIN users on books.user_id = users.id \
            WHERE books.id = $1";
        const commentQuery =
            " SELECT display_picture,display_name,comment,rating,date_commented FROM comments \
            JOIN users ON comments.user_id = users.id \
            WHERE book_id = $1";
        const chapterQuery = "SELECT * FROM chapters WHERE book_id = $1";

        const bookResponse = await db.query(bookQuery, [id]);
        const commentResponse = await db.query(commentQuery, [id]);
        commentResponse.rows.forEach((comment) => {
            comment["timeAgo"] = timeAgo(comment.date_commented);
        });
        const chapterResponse = await db.query(chapterQuery, [id]);
        const object = {
            bookData: bookResponse.rows[0],
            commentData: commentResponse.rows,
            chapterData: chapterResponse.rows,
        };
        return object;
    } catch {
        return "Something went wrong!";
    }
}

async function postComment(rating,comment,user_id, book_id){
    try{
        const query = "INSERT INTO comments (rating, comment, user_id, book_id) \
        VALUES ($1, $2, $3, $4);"

        db.query(query,[rating,comment,user_id,book_id]);
    }catch{
        console.log("Something Went Wrong!")
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

function timeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const elapsed = now - past;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years >= 1) {
        return years + (years === 1 ? " year" : " years") + " ago";
    } else if (months >= 1) {
        return months + (months === 1 ? " month" : " months") + " ago";
    } else if (days >= 1) {
        return days + (days === 1 ? " day" : " days") + " ago";
    } else if (hours >= 1) {
        return hours + (hours === 1 ? " hour" : " hours") + " ago";
    } else if (minutes >= 1) {
        return minutes + (minutes === 1 ? " minute" : " minutes") + " ago";
    } else {
        return seconds + (seconds === 1 ? " second" : " seconds") + " ago";
    }
}

// * Stratergies
passport.use(
    "signUp-local",
    new Strategy(
        { passwordField: "password", usernameField: "email" },

        async function (email, password, cb) {
            let hashedPassword = await bcrypt.hash(password, saltRound);
            if ((await userExist(email)) === false) {
                const response = await addNewUser(
                    email,
                    hashedPassword,
                    null,
                    null,
                    null
                );
                cb(response.error, response.user);
            } else {
                cb("user already exist", null);
            }
        }
    )
);

passport.use(
    "login-local",
    new Strategy(
        { passwordField: "password", usernameField: "email" },
        async function (email, password, cb) {
            if ((await userExist(email)) === true) {
                const user = await getUser(email);
                if (user.password == "Google") {
                    cb("Login with google", null);
                } else if (await bcrypt.compare(password, user.password)) {
                    cb(null, user);
                } else {
                    cb("Wrong Password!", null);
                }
            } else {
                cb("user dosen't exist sign up instead!", null);
            }
        }
    )
);

passport.use(
    "google-strategy",
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/callback",
        },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                if ((await userExist(profile.email)) === false) {
                    const response = await addNewUser(
                        profile.email,
                        "Google",
                        profile.given_name,
                        profile.family_name,
                        profile._json.picture
                    );
                    cb(response.error, response.user);
                } else {
                    try {
                        const user = await getUser(profile.email);
                        cb(null, user);
                    } catch {
                        cb("Login Failed", null);
                    }
                }
            } catch (error) {
                console.log(error);
                cb("something went Wrong!", null);
            }
        }
    )
);

passport.serializeUser((user, cb) => {
    return cb(null, user);
});

passport.deserializeUser((user, cb) => {
    return cb(null, user);
});
