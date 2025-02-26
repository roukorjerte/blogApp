import express from "express";
import fs from "fs";


const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));

const articles = JSON.parse(fs.readFileSync("articles.json", "utf8"));


app.get("/", (req, res) => {
  res.render("index.ejs", { articles });
});

app.get("/all-posts", (req, res) => {
  res.render("allPosts.ejs", { articles });
});

app.get("/create", (req, res) => {
  res.render("create.ejs");
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.get("/articles/:id", (req, res) => {
  const article = articles.find(a => a.id == req.params.id);
  if (article) {
      res.render("article", { article });
  } else {
      res.status(404).send("Статья не найдена");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
