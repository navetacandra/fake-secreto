// Import depeneencies
import express = require("express");
const { config } = require("dotenv");
const {
  readFileSync,
  writeFileSync,
  readdirSync,
  mkdirSync,
  existsSync,
} = require("fs");

config();

// interface
interface AddPostBody {
  author: string;
}

interface AddMsgBody {
  post_id: string;
  message: string;
}

interface PostMessage {
  id: string;
  text: string;
}

interface DataPost {
  id: string;
  author: string;
  messages: PostMessage[];
}

// constants variable
const PORT = process.env.PORT || 3000;
const app = express();

// set express app
app.set("trust proxy", true);
app.set("view engine", "ejs");

// express app middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// express app static route
app.use("/assets", express.static("./assets"));

app.get("/", (req, res) => {
  // renderig home page
  res.render("pages/home");
});

app.post("/add_post", (req, res) => {
  // parsing request bidy
  const reqBody: AddPostBody = req.body;
  const { author } = reqBody;

  // generate post id
  const id: string = "01234567456";
  const p_id: string = `${id}_${Date.now()}`;

  // get post db path from id
  const p_post: string = `./db/post_${p_id}.json`;

  // check if post already created
  if (existsSync(p_post)) return;

  // create post template
  const template: DataPost = {
    id: p_id,
    author: author || "",
    messages: [],
  };

  // write post data
  writeFileSync(p_post, JSON.stringify(template, null, 2));

  // redirecting user
  res.redirect(`/post/${p_id}`);
});

app.post("/add_msg", (req, res) => {
  // paesing request body
  const reqBody: AddMsgBody = req.body;
  const { post_id, message: text } = reqBody;

  // checing if post available
  if (!existsSync(`./db/post_${post_id}.json`)) {
    res.redirect("/");
  }

  // generate message id
  const id: string = "asd312213";
  const msg_id: string = `post_${post_id}__msg-${id}_${Date.now()}`;

  // get post data
  const data_post: DataPost = JSON.parse(
    readFileSync(`./db/post_${post_id}.json`)
  );

  // append request message to post message
  data_post.messages.push({ id: msg_id, text });

  // write new post data
  writeFileSync(
    `./db/post_${post_id}.json`,
    JSON.stringify(data_post, null, 2)
  );

  // redirecting user
  res.redirect(`/post/${post_id}`);
});

app.get("/post/:id", (req, res) => {
  // get id from url
  const { id } = req.params;

  // check if post available
  if (!existsSync(`./db/post_${id}.json`)) {
    // redirecting user to home if nit available
    return res.redirect("/");
  }

  // get all post data
  const {
    id: p_id,
    author,
    messages,
  } = JSON.parse(readFileSync(`./db/post_${id}.json`));

  // rendering post page with post data
  res.render("pages/post", { p_id, author, messages });
});

// running express app
app.listen(PORT, function () {
  // check is db directory available
  if (!existsSync("./db")) {
    // create db directory if not available
    mkdirSync("./db");
  }
  console.log(`Running on port: ${PORT}`);
});
