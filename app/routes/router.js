var express = require("express");
var router = express.Router();
const path = require("path");
const multer = require("multer");
const pool = require("../../config/pool_conexoes");
const { body, validationResult } = require("express-validator");
var { validarCNPJ, validarCPF } = require("../helpers/validacoes");
const { usuarioModel } = require("../models/usuarioModel");
const { ongModel } = require("../models/ongModel");
const { autenticado } = require("../helpers/autenticado");

const storageFoto = multer.diskStorage({
  destination: path.join(__dirname, "../../app/public/uploads/fotos"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const uploadFoto = multer({
  storage: storageFoto,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Formato inválido."));
  }
});

router.get("/login", function (req, res) {
  res.render("pages/login", {
    erros: null,
    valores: { email: "", password: "" },
    retorno: null,
  });
});

router.post(
  "/login",
  body("email").isEmail().withMessage('Digite um e-mail válido!'),
  body("password").isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres!'),
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("pages/login", {
        erros: errors,
        valores: req.body,
        retorno: null,
      });
    }

    const usuario = await usuarioModel.findByEmail(req.body.email);
    if (!usuario || usuario.senha !== req.body.password) {
      return res.render("pages/login", {
        "erros": null,
        "valores": req.body,
        "retorno": { tipo: "erro", msg: "E-mail ou senha incorretos." }
      });
    }

    req.session.usuario = { id: usuario.id_usuario, nome: usuario.nome, email: usuario.email, foto_url: usuario.foto_url || null };
    return res.redirect("/text");
  }
);

router.get("/cadastro", function (req, res) {
  res.render("pages/cadastro", {
    listaErros: null,
    campos: {
      firstname: "",
      email: "",
      cpf: "",
      cnpj: "",
      number: "",
      password: "",
      confirmPassword: "",
    },
    retorno: null,
  });
});
router.post(
  "/cadastro",
  body("firstname")
    .isLength({ min: 2 })
    .withMessage("O nome deve ter minimo 2 caracteres!"),
  body("email").isEmail().withMessage("O e-mail deve ser válido!"),
  body("cnpj")
    .optional({ checkFalsy: true })
    .customSanitizer((value) => value.replace(/\D/g, ""))
    .isLength({ min: 14, max: 14 })
    .withMessage("O CNPJ deve ter 14 dígitos!")
    .custom((value) => {
      if (validarCNPJ(value)) {
        return true;
      } else {
        throw new Error("CNPJ inválido!");
      }
    }),
  body("cpf")
    .customSanitizer((value) => value.replace(/\D/g, ""))
    .isLength({ min: 11, max: 11 })
    .withMessage("O CPF deve ter 11 dígitos!")
    .custom((value) => {
      if (validarCPF(value)) {
        return true;
      } else {
        throw new Error("CPF inválido!");
      }
    }),
  body("number")
    .customSanitizer((value) => value.replace(/\D/g, ""))
    .isLength({ min: 10, max: 11 })
    .withMessage("O celular deve ter 10 ou 11 dígitos!"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("A senha deve ter pelo menos 6 caracteres!"),
  body("confirmPassword")
    .isLength({ min: 6 })
    .withMessage("A senha deve ter pelo menos 6 caracteres!")
    .custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error("As senhas não coincidem!");
      return true;
    }),

  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("pages/cadastro", {
        retorno: null,
        listaErros: errors,
        campos: req.body,
      });
    }

    const resultado = await usuarioModel.create({
      nome: req.body.firstname,
      cpf: req.body.cpf,
      email: req.body.email,
      telefone: req.body.number,
      senha: req.body.password,
      genero: req.body.gender,
    });

    if (resultado.affectedRows) {
      return res.redirect("/login");
    } else {
      return res.render("pages/cadastro", {
        retorno: null,
        listaErros: {
          errors: [{ msg: "Erro ao cadastrar. Tente novamente." }],
        },
        campos: req.body,
      });
    }
  },
);

router.get("/usuarios", async function (req, res) {
  const usuarios = await usuarioModel.findAll();
  res.json(usuarios);
});

// rotas públicas
router.get("/", function (req, res) {
  res.render("pages/text");
});
router.get("/text", function (req, res) {
  res.render("pages/text");
});

router.get("/forum", function (req, res) {
  res.render("pages/forum");
});

// rotas protegidas — exigem login
router.get("/home2", autenticado, function (req, res) {
  res.render("pages/home2");
});
router.get("/planos", autenticado, function (req, res) {
  res.render("pages/planos");
});
router.get("/forms_doacao", autenticado, function (req, res) {
  res.render("pages/forms_doacao");
});
router.get("/ongs", autenticado, function (req, res) {
  res.render("pages/ongs");
});

router.get("/ongs/dados", autenticado, async function (req, res) {
  const ongs = await ongModel.findAll();
  res.json(ongs);
});
router.get("/ong_page", autenticado, function (req, res) {
  res.render("pages/ong_page");
});
router.get("/login_profissionais", autenticado, function (req, res) {
  res.render("pages/login_profissionais");
});
router.get("/perfil_profissional", autenticado, function (req, res) {
  res.render("pages/perfil_profissional");
});
router.get("/perfil_ong", autenticado, function (req, res) {
  res.render("pages/perfil_ong");
});
router.get("/perfil_usuario", autenticado, async function (req, res) {
  const linhas = await usuarioModel.findById(req.session.usuario.id);
  const usuario = linhas[0] || null;
  res.render("pages/perfil_usuario", { usuario });
});

// ── API PERFIL ────────────────────────────────────────────────
router.get("/api/perfil", autenticado, async function (req, res) {
  const linhas = await usuarioModel.findById(req.session.usuario.id);
  const u = linhas[0];
  if (!u) return res.status(404).json({ mensagem: "Usuário não encontrado." });
  res.json({
    nome: u.nome,
    email: u.email,
    telefone: u.telefone,
    genero: u.genero,
    apelido: u.apelido || null,
    sobre: u.sobre || null,
    foto_url: u.foto_url || null,
    plano: u.plano || "free",
  });
});

router.put("/api/perfil/dados", autenticado, async function (req, res) {
  const { nome } = req.body;
  if (!nome || nome.trim().length < 2) {
    return res.status(400).json({ mensagem: "Nome inválido." });
  }
  const linhas = await usuarioModel.findById(req.session.usuario.id);
  const u = linhas[0];
  if (!u) return res.status(404).json({ mensagem: "Usuário não encontrado." });
  await usuarioModel.update({
    id: req.session.usuario.id,
    nome: nome.trim(),
    email: u.email,
    telefone: u.telefone,
    genero: u.genero,
  });
  req.session.usuario.nome = nome.trim();
  res.json({ ok: true });
});

router.put("/api/perfil/email", autenticado, async function (req, res) {
  const { email_atual, email_novo, senha } = req.body;
  const linhas = await usuarioModel.findById(req.session.usuario.id);
  const u = linhas[0];
  if (!u) return res.status(404).json({ mensagem: "Usuário não encontrado." });
  if (u.email !== email_atual) return res.status(400).json({ mensagem: "E-mail atual incorreto." });
  if (u.senha !== senha) return res.status(400).json({ mensagem: "Senha incorreta." });
  await usuarioModel.update({
    id: req.session.usuario.id,
    nome: u.nome,
    email: email_novo,
    telefone: u.telefone,
    genero: u.genero,
  });
  req.session.usuario.email = email_novo;
  res.json({ ok: true });
});

router.post("/api/perfil/foto", autenticado, uploadFoto.single("foto"), async function (req, res) {
  if (!req.file) return res.status(400).json({ mensagem: "Nenhuma imagem enviada." });
  const foto_url = "/uploads/fotos/" + req.file.filename;
  await usuarioModel.updateFoto({ id: req.session.usuario.id, foto_url });
  req.session.usuario.foto_url = foto_url;
  res.json({ foto_url });
});

router.delete("/api/perfil/foto", autenticado, async function (req, res) {
  await usuarioModel.updateFoto({ id: req.session.usuario.id, foto_url: null });
  req.session.usuario.foto_url = null;
  res.json({ ok: true });
});

router.put("/api/perfil/senha", autenticado, async function (req, res) {
  const { senha_atual, senha_nova } = req.body;
  const linhas = await usuarioModel.findById(req.session.usuario.id);
  const u = linhas[0];
  if (!u) return res.status(404).json({ mensagem: "Usuário não encontrado." });
  if (u.senha !== senha_atual) return res.status(400).json({ mensagem: "Senha atual incorreta." });
  await usuarioModel.updateSenha({ id: req.session.usuario.id, senha: senha_nova });
  res.json({ ok: true });
});
router.get("/direitos", autenticado, function (req, res) {
  res.render("pages/direitos");
});
router.get("/sobre_nos", autenticado, function (req, res) {
  res.render("pages/sobre_nos");
});
router.get("/carrossel", autenticado, function (req, res) {
  res.render("pages/carrossel");
});
router.get("/contato", autenticado, function (req, res) {
  res.render("pages/contato");
});
router.get("/geolocalizacao", autenticado, function (req, res) {
  res.render("pages/geolocalizacao");
});
router.get("/tipos_violencia", autenticado, function (req, res) {
  res.render("pages/tipos_violencia");
});


// Rota para salvar a localização atual da vítima no banco
router.post("/api/salvar-localizacao", (req, res) => {
  const { latitude, longitude } = req.body;

  const query =
    "INSERT INTO historico_localizacao (latitude, longitude) VALUES (?, ?)";
  db.query(query, [latitude, longitude], (err, result) => {
    if (err) {
      console.error("Erro ao salvar localização:", err);
      return res.status(500).json({ erro: "Erro interno ao salvar." });
    }
    res.status(200).json({ sucesso: true, id: result.insertId });
  });
});

router.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/login");
});

module.exports = router;
