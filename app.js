const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const session = require("express-session");

app.use(express.static("./app/public"));

app.set("view engine", "ejs");
app.set("views", "./app/views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || "fenix-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 } // 8 horas
}));


app.use(function (req, res, next) {
  res.locals.usuario = req.session.usuario || null;
  next();
});

var rotas = require("./app/routes/router");
app.use("/", rotas);

var rotaAdm = require("./app/routes/router-adm");
app.use("/adm", rotaAdm );


app.listen(process.env.APP_PORT, () => {
  console.log(`Servidor ouvindo na porta ${process.env.APP_PORT}
    \nhttp://localhost:${process.env.APP_PORT}`);
});



