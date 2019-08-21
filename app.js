const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require("connect-flash");
const app = express();

const User = require("./models/user.js");

const restaurantRoutes = require("./routes/restaurants.js");
const dishRoutes = require("./routes/dishes.js");
const indexRoutes = require("./routes/index.js")

app.use(flash());
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect("mongodb://localhost:27017/testdb", {useNewUrlParser: true});

// Configure view engine to render ejs templates
app.use(express.static('public'));
app.set("view engine", "ejs");

// Passport config
app.use(require("express-session")({
    secret: "this is the secret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/diary/:username/restaurants", restaurantRoutes);
app.use("/diary/:username/restaurants/:id/dishes/", dishRoutes);
app.use("/", indexRoutes)

app.use((req, res, next) => {
    let err = new Error("Page not found");
    err.statusCode = 404;
    next(err);
});

// Error handler
app.use((err, req, res, next) => {
    if (!err.statusCode) { err.statusCode = 500; }
    res.status(err.statusCode).render('error');
});

module.exports = app;
