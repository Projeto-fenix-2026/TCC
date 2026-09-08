const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const session = require("express-session");
const { usuarioModel } = require("./app/models/usuarioModel");

app.use(express.static("./app/public"));

app.set("view engine", "ejs");
app.set("views", "./app/views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "fenix-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 horas
  }),
);

app.use(async function (req, res, next) {
  try {
    res.locals.usuario = req.session.usuario || null;
    if (res.locals.usuario && res.locals.usuario.id) {
      const usuario = await usuarioModel.findById(res.locals.usuario.id);
      const dadosUsuario = usuario && usuario[0] ? usuario[0] : null;

      if (dadosUsuario) {
        req.session.usuario = {
          ...req.session.usuario,
          id: dadosUsuario.id_usuario,
          nome: dadosUsuario.nome,
          email: dadosUsuario.email,
          foto_url: dadosUsuario.foto_url || null,
        };
      }

      res.locals.usuario = req.session.usuario;
    }
  } catch (error) {
    console.error("Erro ao sincronizar usuário da sessão:", error);
  }

  res.locals.currentPath = req.path;
  next();
});

var rotas = require("./app/routes/router");
app.use("/", rotas);

var rotaAdm = require("./app/routes/router-adm");
app.use("/adm", rotaAdm);

app.listen(process.env.APP_PORT, () => {
  console.log(`Servidor ouvindo na porta ${process.env.APP_PORT}
    \nhttp://localhost:${process.env.APP_PORT}`);
});
