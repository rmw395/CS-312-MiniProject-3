import bodyParser from "body-parser";
import express from "express";
import pg from "pg";
import { dirname } from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "blogapp",
    password: "y^x6kMHJ@pm6Ja",
    port: 5432
});
db.connect();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

let posts = [];
let current_user = null;

app.listen(port, () => {
    console.log(`Server started on port ${port}.`)
});

app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM blogs ORDER BY blog_id ASC");
        posts = result.rows;

        res.render("index.ejs", {posts});
    } catch (err) {
        console.log(err);
    }
});

app.get("/create", (req, res) => {
    res.render("create.ejs");
});

app.post("/submit", async (req, res) => {
    const postTitle = req.body['title'];
    const postContent = req.body['content'];

    let displayName = await db.query("SELECT name FROM users WHERE user_id = $1", 
        [current_user]
    );

    displayName = displayName.rows[0].name;

    const newPost = {
        title: postTitle,
        body: postContent,
        creator_name: displayName,
        creator_user_id: current_user //,
        //date: today.toDateString()
    };

    // posts.push(newPost);

    // temp
    let date = "2025-07-10 10:45:03";

    await db.query("INSERT INTO blogs (creator_name, creator_user_id, title, body, date_created) VALUES ($1, $2, $3, $4, $5)",
        [displayName, current_user, postTitle, postContent, date]
    );
    res.redirect("/");
});

app.get("/edit/:id", (req, res) => {
    // TODO: only edit if correct user

    const postId = req.params.id;
    const postToEdit = posts[postId];

    res.render("create.ejs", {postToEdit, postId});
});

app.post("/edit/:id", (req, res) => {
    const postId = req.params.id;

    posts[postId].title = req.body.title;
    posts[postId].body = req.body.content;

    res.redirect("/");
});

app.post("/delete/:id", async (req, res) => {
    if (current_user = req.body.user_id) {
        // posts.splice(req.params.id, 1);

        // TODO: get id correctly (hidden form value?)

        try { 
            await db.query("DELETE FROM blogs WHERE blog_id = $1",
                [req.params.id]
            );
        } catch (err) {
            console.log(err);
        }
    }

    res.redirect("/");
});

app.get("/signup", (req, res) => {
    res.render("signup.ejs");
});

app.post("/signup", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const displayName = req.body.displayName;

    try {
        // TODO: check for user id already taken

        await db.query("INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)", 
            [username, password, displayName]
        );
        res.redirect("/login");
    } catch (err) {
        console.log(err);
    }
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        // log in
        const user = await db.query("SELECT * FROM users WHERE user_id = $1 AND password = $2",
            [username, password]
        );

        if (user.rowCount > 0) { // !(current_user = null)
            current_user = username;

            res.redirect("/");
        } else {
            // TODO: prompt user to try again
        }

    } catch (err) {
        console.log(err);
    }
});
