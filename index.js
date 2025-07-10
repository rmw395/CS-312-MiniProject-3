import bodyParser from "body-parser";
import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

const db = new PG.Client({
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

app.listen(port, () => {
    console.log(`Server started on port ${port}.`)
});

app.get("/", (req, res) => {
    res.render("index.ejs", {posts});
});

app.get("/create", (req, res) => {
    res.render("create.ejs");
});

app.get("/edit/:id", (req, res) => {
    const postId = req.params.id;
    const postToEdit = posts[postId];

    res.render("create.ejs", {postToEdit, postId});
});

app.post("/submit", (req, res) => {
    const postAuthor = req.body['author'];
    const postTitle = req.body['title'];
    const postContent = req.body['content'];
    const newPost = {
        pAuthor: postAuthor,
        pTitle: postTitle,
        pContent: postContent,
        // pDate: today.toDateString()
    };

    posts.push(newPost);
    res.redirect("/");
});

app.post("/edit/:id", (req, res) => {
    const postId = req.params.id;

    posts[postId].pAuthor = req.form.author;
    posts[postId].pTitle = req.form.title;
    posts[postId].pContent = req.form.content;

    res.redirect("/");
});

app.post("/delete/:id", (req, res) => {
    posts.splice(req.params.id, 1);

    res.redirect("/");
});
