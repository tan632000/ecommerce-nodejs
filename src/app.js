require("dotenv").config();
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
app.use(express.json());
app.use(express.urlencoded({ extends: true }));

// init db
require("./dbs/init.mongodb");
// const { checkOverload } = require("./helpers/check.connect");
// checkOverload();

// init router
app.use("", require("./routes/index"));

// handling error

app.use((req, res,next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: error.message || 'Internal Server Error'
    })
})

module.exports = app;
