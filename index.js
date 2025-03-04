import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/media"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); 
  }
});

const upload = multer({ storage });
const app = express();
const port = 3000;


app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const articles = JSON.parse(fs.readFileSync("articles.json", "utf8"));


app.get("/", (req, res) => {
  const sortedArticles = [...articles].sort((a, b) => b.id - a.id);
  const latestArticle = sortedArticles[0];
  const nextArticles = sortedArticles.slice(1, 4);
  res.render("index.ejs", { latestArticle, nextArticles });
});

app.get("/all-posts", (req, res) => {
  const sortedArticles = [...articles].sort((a, b) => b.id - a.id);
  res.render("allPosts.ejs", { articles: sortedArticles });
});

app.get("/create", (req, res) => {
  res.render("create.ejs");
});

app.get("/articles/:id", async (req, res) => {
  try {
    const articles = JSON.parse(await fs.promises.readFile("articles.json", "utf8"));
    const article = articles.find(a => a.id == req.params.id);
    if (article) {
      res.render("article", { article });
    } else {
      res.status(404).send("Статья не найдена");
    }
  } catch (error) {
    console.error("Ошибка при загрузке статьи:", error);
    res.status(500).send("Ошибка сервера");
  }
});



app.post("/articles", upload.single("post-image"), async (req, res) => {
  try {
    const articles = JSON.parse(fs.readFileSync("articles.json", "utf8"));
    const newId = articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1;
    const newArticle = {
      id: newId,
      title: req.body["post-title"],
      text: req.body["post-text"],
      image: req.file ? `/media/${req.file.filename}` : "/media/kitten-placeholder.png",
      url: `/articles/${newId}`,
      timestamp: new Date().toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    };

    async function createArticle() {
      articles.push(newArticle);
      await fs.promises.writeFile("articles.json", JSON.stringify(articles, null, 2));
    }

    await createArticle();
    res.redirect(newArticle.url);
  } catch (error) {
    console.error("Ошибка при создании статьи:", error);
    res.status(500).send("Ошибка сервера");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
