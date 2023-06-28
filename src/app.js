const express = require("express");
// morgan dung de hien thi thong tin khi query
const morgan = require("morgan");
// ngan ngua hacker check backend su dung cong nghe gi
const helmet = require("helmet");
// dung de reduce bang thong khi gui du lieu cho client
const compression = require("compression");
const app = express();

// init middlewares
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
// morgan("combined");
// morgan("common");
// morgan("short");
// morgan("tiny");
// init db

// init router
app.get("/", (req, res, next) => {
  const str = "Hrllo world";
  return res.status(200).json({
    message: "Welcome",
    metadata: str.repeat(10000),
  });
});

// handling error

module.exports = app;
