const express = require("express");
const app = express();
const cors = require("cors");
const routes = require("./routes/routes");
const helmet = require("helmet");

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.options("*", cors());

app.use("/v1", routes);

module.exports = app;
