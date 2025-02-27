import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/media"); // Сохраняем в папку public/media
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Уникальное имя файла
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

app.get("/articles/:id", (req, res) => {
  const article = articles.find(a => a.id == req.params.id);
  if (article) {
      res.render("article", { article });
  } else {
      res.status(404).send("Статья не найдена");
  }
});


app.post("/articles", upload.single("post-image"), (req, res) => {
  // Читаем текущие статьи
  const articles = JSON.parse(fs.readFileSync("articles.json", "utf8"));

  // Находим максимальный id и увеличиваем на 1
  const newId = articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1;

  // Создаем новый объект статьи
  const newArticle = {
    id: newId,
    title: req.body["post-title"],
    text: req.body["post-text"],
    image: req.file ? `/media/${req.file.filename}` : "/media/placeholder.jpg",
    url: `/articles/${newId}`,
    timestamp: new Date().toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  };

  // Добавляем новую статью в массив
  articles.push(newArticle);

  // Записываем в articles.json
  fs.writeFileSync("articles.json", JSON.stringify(articles, null, 2));

  // Перенаправляем на страницу новой статьи
  res.redirect(newArticle.url);
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
