const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const nocache = require("nocache");
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");

const app = express();
const PORT = 3000;

mongoose.connect("mongodb://127.0.0.1:27017/user_management");

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(nocache());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public/userImages"));

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/", userRoute);
app.use("/admin", adminRoute);

app.listen(PORT, function () {
  console.log(`Server is running on ${PORT}`);
});
