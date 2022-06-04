// Import depeneencies
const express = require("express");
const { config } = require("dotenv");
const {
  readFileSync,
  writeFileSync,
  readdirSync,
  mkdirSync,
  existsSync,
} = require("fs");

config();
const app = express();

// constants variable
const PORT = process.env.PORT || 3000;

// set express app
app.set("trust proxy", true);
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/assets", express.static("./assets"));

app.get("/", function (req, res) {
  res.status(200);
  res.render("pages/home");
});

app.get("/add_post", function (req, res) {
  res.status(200);
  const { author } = req.query;
  const id = "01234567456";
  const p_id = `${id}_${Date.now()}`;
  const p_post = `./db/post_${p_id}.json`;
  if (existsSync(p_post)) return;
  const template = {
    id: p_id,
    author: author || "",
    messages: [],
  };
  writeFileSync(p_post, JSON.stringify(template, null, 2));
  res.render("template/redirecter", { path: `/post/${p_id}` });
});

app.get("/add_msg", function (req, res, next) {
  res.status(200);
  const { post_id, message: text } = req.query;
  if (!existsSync(`./db/post_${post_id}.json`)) {
    res.render("template/redirecter", { path: "/" });
  }
  const id = "asd312213";
  const msg_id = `post_${post_id}__msg-${id}_${Date.now()}`;
  const data_post = JSON.parse(readFileSync(`./db/post_${post_id}.json`));
  data_post.messages.push({ id: msg_id, text });
  writeFileSync(
    `./db/post_${post_id}.json`,
    JSON.stringify(data_post, null, 2)
  );
  res.render("template/redirecter", { path: `/post/${post_id}` });
});

app.get("/post/:id", function (req, res) {
  res.status(200);
  const { id } = req.params;
  if (!existsSync(`./db/post_${id}.json`)) {
    return res.render("template/redirecter", { path: "/" });
  }
  const {
    id: p_id,
    author,
    messages,
  } = JSON.parse(readFileSync(`./db/post_${id}.json`));
  res.render("pages/post", { p_id, author, messages });
});

// running express app
app.listen(PORT, function () {
  if (!existsSync("./db")) {
    mkdirSync("./db");
  }
  console.log(`Running on port: ${PORT}`);
});
