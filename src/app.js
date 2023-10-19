const express = require("express");
const logger = require("morgan");
const path = require("path");
const passport = require("passport");
const session = require("express-session"); // Make sure you've installed this package
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressSanitizer = require("express-sanitizer");
const helmet = require("helmet");
const rfs = require("rotating-file-stream");
require("./passport");

module.exports = {
  setup: (config) => {
    const app = express();

    var accessLogStream = rfs.createStream("access.log", {
      interval: "1d",
      path: path.join(__dirname, "..", "log"),
    });

    app.use(logger(process.env.APP_LOG, { stream: accessLogStream }));

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json({ limit: "50mb" }));

    app.use(cookieParser(process.env.APP_SECRET));
    app.use(
      session({
        secret: process.env.APP_SECRET,
        resave: true,
        saveUninitialized: true,
      })
    );
    app.use("/photo", express.static(path.join(__dirname, "public/images")));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(expressSanitizer());
    app.use(helmet());
    app.use(
      helmet.hsts({
        maxAge: 0,
      })
    );

    Number.prototype.pad = function (size) {
      var s = String(this);
      while (s.length < (size || 2)) {
        s = "0" + s;
      }
      return s;
    };

    return app;
  },
};
