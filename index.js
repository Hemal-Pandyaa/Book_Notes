//* This type of comment mean section
//? And this mean sub-section
// and this is normal comment
//! You may install Better comments Extension by Aaron Bond for highlighting

//* importing
import express, { response } from "express";
import pg from "pg";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import bcrypt from "bcryptjs";
import env from "dotenv";
import cookieParser from "cookie-parser";
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
app.use(cookieParser());

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
    if (req.isAuthenticated()) {
        console.log("Authenticated : True");
        if (req.user.display_picture == null) {
            data["profileImage"] = "Not avalabile";
        } else {
            data["profileImage"] = req.user.display_picture;
        }
        console.log(req.cookies);
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

app.get("/user/profile", (req, res) => {
    res.render("profile.ejs");
});

app.get("/me", (req, res) => {
    if (req.isAuthenticated()) {
        console.log(req.user)
        if (!req.user.display_name) {
            res.render("display_name.ejs");
            return;
        }
        res.render("profile.ejs", { user: req.user });
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

app.post("/me", (req, res) => {
    if (req.isAuthenticated()) {
        updateDisplayName(req.body.display_name, req.user.email);
        res.redirect("/me");
    } else {
        res.redirect("/login");
    }
});

app.post(
    "/auth/local/Sign-up",
    passport.authenticate("signUp-local", {
        successRedirect: "/user/completeProfile",
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
        const query = `INSERT INTO users (email,password, fName, lName, display_picture, complete_profile) VALUES ($1, $2, $3, $4, '${d_picture}', FALSE) RETURNING *`;
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
        console.log(user.rows.length);
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
        console.log(display_name, email)
        const query = "UPDATE users SET display_name = $1 WHERE email = $2 RETURNING *";
        const response = await db.query(query, [display_name, email]);
        console.log(response)
    } catch(error) {
        console.log(error, "Something went wrong!")
        return null;
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
                if (await bcrypt.compare(password, user.password)) {
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
            console.log(profile._json.picture);
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
