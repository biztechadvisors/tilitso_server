const passport = require("passport");
const JWT = require("jsonwebtoken");
const config = require("../config");
const { db } = require("../models");
const { OAuth2Client } = require("google-auth-library");
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccount.json");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID_FIREBASE);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
  });
  const payload = ticket.getPayload();
  return payload;
}

const JWTSign = function (iss, user, date) {
  return JWT.sign(
    {
      iss: iss,
      sub: user.id,
      iam: user.type,
      iat: date.getTime(),
      exp: new Date().setMinutes(date.getMinutes() + 30),
    },
    config.app.secret
  );
};

exports.googleLoginStrategy = (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: req.query.callbackURL,
  })(req, res, next);
};

exports.googleLoginCallbackStrategy = (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: "/login" },
    function (err, user) {
      if (err && Object.keys(err).length) {
        return res.status(500).json({ errors: [err] });
      }
      req.user = user;
      next();
    }
  )(req, res, next);
};

exports.firebaseLoginWithIdTokenStrategy = async (req, res, next) => {
  try {
    const payload = await admin.auth().verifyIdToken(req.body.idToken);
    const { phone_number } = payload;
    const [user, created] = await db.customer.findOrCreate({
      where: { phone: phone_number },
      defaults: {
        verify: true,
        firstName: req.body.name,
      },
    });
    req.user = user;
    next();
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ errors: [err] });
  }
};

exports.googleLoginWithIdTokenStrategy = async (req, res, next) => {
  try {
    const payload = await verify(req.body.idToken);
    const { email, family_name, given_name } = payload;
    const [user, created] = await db.customer.findOrCreate({
      where: { email: email },
      defaults: {
        firstName: req.body.name || given_name,
        lastName: family_name,
        verify: true,
      },
    });
    req.user = user;
    next();
  } catch (err) {
    console.log({ err });
    return res.status(500).json({ errors: [err] });
  }
};

exports.jwtStrategy = (req, res, next) => {
  passport.authenticate("user-jwt", { session: false }, (err, user, info) => {
    let contype = req.headers["content-type"];
    var json = !(!contype || contype.indexOf("application/json") !== 0);
    if (err && err == "expired") {
      return json
        ? res.status(500).json({ errors: ["Session is expired"] })
        : res.redirect("https://admin.souqarena.com/auth/login");
    }
    if (err && err == "invalid") {
      return json
        ? res.status(500).json({ errors: ["Invalid token recieved"] })
        : res.redirect("https://admin.souqarena.com/auth/login");
    }
    if (err && err == "user") {
      return json
        ? res.status(500).json({ errors: ["Invalid user recieved"] })
        : res.redirect("https://admin.souqarena.com/auth/login");
    }
    if (err && Object.keys(err).length) {
      return res.status(500).json({ errors: [err] });
    }
    if (err) {
      return res.status(500).json({ errors: ["Invalid user recieved"] });
    }
    if (!user) {
      return json
        ? res.status(500).json({ errors: ["Invalid user recieved"] })
        : res.redirect("/login");
    }
    req.user = user;
    next();
  })(req, res, next);
};

exports.localStrategy = (req, res, next) => {
  passport.authenticate("user-local", { session: false }, (err, user, info) => {
    if (err && err == "invalid") {
      return res.status(500).json({ errors: ["Email Id not verified"] });
    }
    if (err && err == "attempt") {
      return res.status(500).json({
        errors: ["Too many invalid attempts. Please reset your password."],
      });
    }
    if (err && err.startsWith("attempt:")) {
      return res.status(500).json({
        errors: [
          "Invalid Credentials (" + err.split(":")[1] + " Attempt(s) Left)",
        ],
      });
    }
    if (err) {
      return res.status(500).json({ errors: [err] });
    }
    if (!user) {
      return res.status(500).json({ errors: ["Invalid Credentials"] });
    }
    req.user = user;
    next();
  })(req, res, next);
};

exports.sellerStrategy = (req, res, next) => {
  passport.authenticate(
    "seller-local",
    { session: false },
    (err, user, info) => {
      if (err && err == "invalid") {
        return res.status(500).json({ errors: ["Email Id not verified"] });
      }
      if (err && err == "attempt") {
        return res.status(500).json({
          errors: ["Too many invalid attempts. Please reset your password."],
        });
      }
      if (err && err.startsWith("attempt:")) {
        return res.status(500).json({
          errors: [
            "Invalid Credentials (" + err.split(":")[1] + " Attempt(s) Left)",
          ],
        });
      }
      if (err) {
        return res.status(500).json({ errors: [err] });
      }
      if (!user) {
        return res.status(500).json({ errors: ["Invalid Credentials"] });
      }
      req.user = user;
      next();
    }
  )(req, res, next);
};

exports.jwtCustomerStrategy = (req, res, next) => {
  passport.authenticate(
    "customer-jwt",
    { session: false },
    (err, user, info) => {
      let contype = req.headers["content-type"];
      var json = !(!contype || contype.indexOf("application/json") !== 0);
      if (err && err == "expired") {
        return res.status(401).json({ errors: ["Session is expired"] });
        /* res.redirect('/login') */ ("");
      }
      if (err && err == "invalid") {
        return res.status(401).json({ errors: ["Invalid token recieved"] });
        /* res.redirect('/login') */ ("");
      }
      if (err && err == "user") {
        return res.status(403).json({ errors: ["Invalid user recieved"] });
        /* res.redirect('https://souqarena.com/login') */ ("");
      }
      if (err && Object.keys(err).length) {
        return res.status(401).json({ errors: [err] });
      }
      if (err) {
        return res.status(401).json({ errors: ["Invalid user recieved"] });
      }
      if (!user) {
        return res.status(401).json({ errors: ["Invalid user recieved"] });
        /* res.redirect('https://souqarena.com/login') */ ("");
      }
      req.user = user;
      next();
    }
  )(req, res, next);
};

exports.localCustomerStrategy = (req, res, next) => {
  passport.authenticate(
    "customer-local",
    { session: false },
    (err, user, info) => {
      if (err && err == "invalid") {
        return res.status(500).json({ errors: ["Email Id not verified"] });
      }
      if (err && err == "attempt") {
        return res.status(500).json({
          errors: ["Too many invalid attempts. Please reset your password."],
        });
      }
      if (err && err.startsWith("attempt:")) {
        return res.status(500).json({
          errors: [
            "Invalid Credentials (" + err.split(":")[1] + " Attempt(s) Left)",
          ],
        });
      }
      if (err) {
        return res.status(500).json({ errors: [err] });
      }
      if (!user) {
        return res.status(500).json({ errors: ["Invalid Credentials"] });
      }
      req.user = user;
      next();
    }
  )(req, res, next);
};

// const GoogleStrategy = require('passport-google-oauth20').Strategy;
