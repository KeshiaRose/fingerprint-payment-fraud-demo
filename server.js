require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 3000;
const apiRouter = require("./api");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cookieParser());

app.get(`/checkout`, (req, res) => {
  res.render("checkout");
});

app.get(`/confirmation`, (req, res) => {
  const orderNum = req.cookies.orderNum || 123456;
  res.render("confirmation", { orderNum });
});

app.use("/api", apiRouter);

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
