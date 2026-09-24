var express = require("express");
var router = express.Router();
const path = require("path");
const multer = require("multer");
var bcrypt = require("bcryptjs");
const pool = require("../../config/pool_conexoes");
const { body, validationResult } = require("express-validator");
var { validarCNPJ, validarCPF } = require("../helpers/validacoes");
const { usuarioModel } = require("../models/usuarioModel");
const { ongModel } = require("../models/ongModel");
const { forumModel } = require("../models/forumModel");
const { socorroModel } = require("../models/socorroModel");
const { autenticado } = require("../helpers/autenticado");
const { perguntarChatbot } = require("../helpers/gemini");

const storageFoto = multer.diskStorage({
  destination: path.join(__dirname, "../../app/public/uploads/fotos"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const uploadFoto = multer({
  storage: storageFoto,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Formato inválido."));
  },
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
  body("email").isEmail().withMessage("Digite um e-mail válido!"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("A senha deve ter pelo menos 6 caracteres!"),
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
    const senhaCorreta =
      usuario && bcrypt.compareSync(req.body.password, usuario.senha);
    if (!senhaCorreta) {
      return res.render("pages/login", {
        erros: null,
        valores: req.body,
        retorno: { tipo: "erro", msg: "E-mail ou senha incorretos." },
      });
    }

    req.session.usuario = {
      id: usuario.id_usuario,
      nome: usuario.nome,
      email: usuario.email,
    };
    req.session.usuario = {
      id: usuario.id_usuario,
      nome: usuario.nome,
      email: usuario.email,
      foto_url: usuario.foto_url || null,
    };
    return res.redirect("/text");
  },
);

/* ============================================================
   ROTAS DE AUTENTICAÇÃO: CADASTRO
   ============================================================ */
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
      senha: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
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

/* ============================================================
   ROTAS DE CONSULTA E RENDERIZAÇÃO DE PÁGINAS SEMÂNTICAS
   ============================================================ */
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

router.get("/forum", autenticado, function (req, res) {
  res.render("pages/forum");
});

// ── API FÓRUM ─────────────────────────────────────────────────
router.get("/api/forum/posts", autenticado, async function (req, res) {
  const posts = await forumModel.findAll();
  res.json(posts);
});

router.get("/api/forum/meus-posts", autenticado, async function (req, res) {
  const posts = await forumModel.findByUsuario(req.session.usuario.id);
  res.json(posts);
});

router.post(
  "/api/forum/posts",
  autenticado,
  body("titulo")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("O título deve ter entre 5 e 200 caracteres."),
  body("conteudo")
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage("O texto deve ter entre 10 e 5000 caracteres."),
  body("categoria")
    .trim()
    .notEmpty()
    .withMessage("Escolha uma categoria."),
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ mensagem: errors.array()[0].msg });
    }

    const categoria = req.body.categoria;
    const titulo = req.body.titulo;
    const conteudo = req.body.conteudo;

    const resultado = await forumModel.create({
      id_usuario: req.session.usuario.id,
      categoria,
      titulo,
      conteudo,
    });

    if (!resultado.insertId) {
      return res
        .status(500)
        .json({ mensagem: "Erro ao publicar. Tente novamente." });
    }

    // Responde com os próprios dados já em mãos, sem outra consulta ao
    // banco — evita uma segunda viagem de rede até o MySQL remoto.
    res.status(201).json({
      id_post: resultado.insertId,
      categoria,
      titulo,
      conteudo,
      criado_em: new Date().toISOString(),
      id_usuario: req.session.usuario.id,
      autor_nome: req.session.usuario.nome,
      autor_foto: req.session.usuario.foto_url,
    });
  },
);

router.put(
  "/api/forum/posts/:id",
  autenticado,
  body("titulo")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("O título deve ter entre 5 e 200 caracteres."),
  body("conteudo")
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage("O texto deve ter entre 10 e 5000 caracteres."),
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ mensagem: errors.array()[0].msg });
    }

    const post = await forumModel.findById(req.params.id);
    if (!post)
      return res.status(404).json({ mensagem: "Publicação não encontrada." });
    if (post.id_usuario !== req.session.usuario.id) {
      return res
        .status(403)
        .json({ mensagem: "Você não pode editar esta publicação." });
    }

    await forumModel.update({
      id_post: req.params.id,
      id_usuario: req.session.usuario.id,
      categoria: req.body.categoria || post.categoria,
      titulo: req.body.titulo,
      conteudo: req.body.conteudo,
    });
    res.json({ ok: true });
  },
);

router.delete("/api/forum/posts/:id", autenticado, async function (req, res) {
  const post = await forumModel.findById(req.params.id);
  if (!post)
    return res.status(404).json({ mensagem: "Publicação não encontrada." });
  if (post.id_usuario !== req.session.usuario.id) {
    return res
      .status(403)
      .json({ mensagem: "Você não pode excluir esta publicação." });
  }
  await forumModel.deleteById(req.params.id, req.session.usuario.id);
  res.json({ ok: true });
});

// rotas protegidas — exigem login
router.get("/home2", function (req, res) {
  res.render("pages/home2");
});
router.get("/planos", function (req, res) {
  res.render("pages/planos");
});
router.get("/forms_doacao", function (req, res) {
  res.render("pages/forms_doacao");
});
router.get("/ongs", autenticado, function (req, res) {
  res.render("pages/ongs");
});

router.get("/ongs/dados", autenticado, async function (req, res) {
  const ongs = await ongModel.findAll();
  res.json(ongs);
});
router.get("/ong_page", autenticado, async function (req, res) {
  const ong = await ongModel.findById(req.query.id);
  if (!ong) return res.redirect("/ongs");
  res.render("pages/ong_page", { ong });
});
router.get("/login_profissionais", function (req, res) {
  res.render("pages/login_profissionais");
});
router.get("/perfil_profissional", function (req, res) {
  res.render("pages/perfil_profissional");
});

router.get("/perfil_ong", function (req, res) {
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
  const { nome, telefone, apelido, sobre } = req.body;
  if (!nome || nome.trim().length < 2) {
    return res.status(400).json({ mensagem: "Nome inválido." });
  }

  const telefoneLimpo = String(telefone || "").replace(/\D/g, "");
  if (telefone && !/^\d{10,11}$/.test(telefoneLimpo)) {
    return res
      .status(400)
      .json({ mensagem: "Telefone inválido. Use 10 ou 11 dígitos." });
  }

  const linhas = await usuarioModel.findById(req.session.usuario.id);
  const u = linhas[0];
  if (!u) return res.status(404).json({ mensagem: "Usuário não encontrado." });

  await usuarioModel.updatePerfil({
    id: req.session.usuario.id,
    nome: nome.trim(),
    telefone: telefoneLimpo || u.telefone,
    apelido: apelido ? String(apelido).trim().slice(0, 60) : null,
    sobre: sobre ? String(sobre).trim().slice(0, 1000) : null,
  });

  req.session.usuario.nome = nome.trim();
  res.json({ ok: true, telefone: telefoneLimpo || u.telefone });
});

router.put("/api/perfil/email", autenticado, async function (req, res) {
  const { email_atual, email_novo, senha } = req.body;
  const linhas = await usuarioModel.findById(req.session.usuario.id);
  const u = linhas[0];
  if (!u) return res.status(404).json({ mensagem: "Usuário não encontrado." });
  if (u.email !== email_atual)
    return res.status(400).json({ mensagem: "E-mail atual incorreto." });
  if (u.senha !== senha)
    return res.status(400).json({ mensagem: "Senha incorreta." });
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

router.post(
  "/api/perfil/foto",
  autenticado,
  function (req, res, next) {
    uploadFoto.single("foto")(req, res, function (err) {
      if (err) {
        const msg =
          err.code === "LIMIT_FILE_SIZE"
            ? "Imagem maior que 5 MB."
            : err.message || "Erro ao enviar imagem.";
        return res.status(400).json({ mensagem: msg });
      }
      next();
    });
  },
  async function (req, res) {
    if (!req.file)
      return res.status(400).json({ mensagem: "Nenhuma imagem enviada." });
    const foto_url = "/uploads/fotos/" + req.file.filename;
    await usuarioModel.updateFoto({ id: req.session.usuario.id, foto_url });
    req.session.usuario.foto_url = foto_url;
    res.json({ foto_url });
  },
);

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
  if (!bcrypt.compareSync(senha_atual, u.senha))
    return res.status(400).json({ mensagem: "Senha atual incorreta." });
  await usuarioModel.updateSenha({
    id: req.session.usuario.id,
    senha: bcrypt.hashSync(senha_nova, bcrypt.genSaltSync(10)),
  });
  res.json({ ok: true });
});

router.delete("/api/perfil/conta", autenticado, async function (req, res) {
  const resultado = await usuarioModel.deleteById(req.session.usuario.id);
  if (!resultado.affectedRows) {
    return res
      .status(500)
      .json({ mensagem: "Erro ao excluir a conta. Tente novamente." });
  }
  req.session.destroy(function () {
    res.json({ ok: true });
  });
});

// ── API NÚMEROS DE SOCORRO (perfil + botão de emergência) ──────
router.get("/api/socorro", autenticado, async function (req, res) {
  const contatos = await socorroModel.findByUsuario(req.session.usuario.id);
  res.json(contatos);
});

router.post(
  "/api/socorro",
  autenticado,
  body("nome")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Informe um nome com pelo menos 2 caracteres."),
  body("numero")
    .customSanitizer((value) => String(value || "").replace(/\D/g, ""))
    .isLength({ min: 2, max: 20 })
    .withMessage("Informe um número de telefone válido."),
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ mensagem: errors.array()[0].msg });
    }

    const resultado = await socorroModel.create({
      id_usuario: req.session.usuario.id,
      nome: req.body.nome.trim(),
      numero: req.body.numero,
      categoria: req.body.categoria ? String(req.body.categoria).trim() : null,
      icone: req.body.icone ? String(req.body.icone).trim() : "phone",
      descricao: req.body.descricao ? String(req.body.descricao).trim() : null,
    });

    if (!resultado.insertId) {
      return res
        .status(500)
        .json({ mensagem: "Erro ao salvar contato. Tente novamente." });
    }

    const contato = await socorroModel.findById(resultado.insertId);
    res.status(201).json(contato);
  },
);

router.delete("/api/socorro/:id", autenticado, async function (req, res) {
  const contato = await socorroModel.findById(req.params.id);
  if (!contato)
    return res.status(404).json({ mensagem: "Contato não encontrado." });
  if (contato.id_usuario !== req.session.usuario.id) {
    return res
      .status(403)
      .json({ mensagem: "Você não pode remover este contato." });
  }
  await socorroModel.deleteById(req.params.id, req.session.usuario.id);
  res.json({ ok: true });
});

router.get("/direitos", function (req, res) {
  res.render("pages/direitos");
});

router.get("/sobre_nos", function (req, res) {
  res.render("pages/sobre_nos");
});

router.get("/carrossel", function (req, res) {
  res.render("pages/carrossel");
});

router.get("/contato", function (req, res) {
  res.render("pages/contato");
});

router.get("/text", function (req, res) {
  res.render("pages/text");
});
router.get("/geolocalizacao", autenticado, function (req, res) {
  res.render("pages/geolocalizacao");
});
router.get("/tipos_violencia", function (req, res) {
  res.render("pages/tipos_violencia");
});

router.get("/configuracoes", autenticado, async function (req, res) {
  const linhas = await usuarioModel.findById(req.session.usuario.id);
  const usuario = linhas[0] || null;
  res.render("pages/configuracoes", { usuario });
});

/* ============================================================
   FUNCIONALIDADE SEGURANÇA: GEOLOCALIZAÇÃO (Corrigido para Promises)
   ============================================================ */
router.post("/api/salvar-localizacao", async (req, res) => {
  const { latitude, longitude } = req.body;
  const query =
    "INSERT INTO historico_localizacao (latitude, longitude) VALUES (?, ?)";

  try {
    const [result] = await pool.query(query, [latitude, longitude]);
    res.status(200).json({ sucesso: true, id: result.insertId });
  } catch (err) {
    console.error("Erro ao salvar localização:", err);
    return res.status(500).json({ erro: "Erro interno ao salvar." });
  }
});

/* ============================================================
   FUNCIONALIDADE: CENTRAL DE CONTATO E SUPORTE (Corrigido para Promises)
   ============================================================ */
router.post(
  "/api/suporte",
  [
    body("nome")
      .trim()
      .notEmpty()
      .withMessage("O nome completo é obrigatório.")
      .isLength({ min: 3, max: 60 })
      .withMessage("O nome deve ter entre 3 e 60 caracteres."),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("O e-mail é obrigatório.")
      .isEmail()
      .withMessage("Informe um endereço de e-mail válido."),
    body("assunto")
      .trim()
      .notEmpty()
      .withMessage("O assunto é obrigatório.")
      .isIn(["duvida", "tecnico", "ong", "denuncia", "outro"])
      .withMessage("Assunto selecionado inválido."),
    body("mensagem")
      .trim()
      .notEmpty()
      .withMessage("A mensagem não pode estar vazia.")
      .isLength({ min: 15, max: 1000 })
      .withMessage("A mensagem deve conter entre 15 e 1000 caracteres."),
  ],
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        mensagem: errors.array()[0].msg,
      });
    }

    const { nome, email, assunto, mensagem } = req.body;
    const query =
      "INSERT INTO chamados_suporte (nome, email, assunto, mensagem, data_envio) VALUES (?, ?, ?, ?, NOW())";

    try {
      await pool.query(query, [nome, email, assunto, mensagem]);
      return res
        .status(200)
        .json({ mensagem: "Mensagem enviada com sucesso!" });
    } catch (err) {
      console.error("Erro ao salvar chamado de suporte:", err);
      return res.status(500).json({
        mensagem: "Erro interno do servidor ao processar o chamado.",
      });
    }
  },
);

/* ============================================================
   FUNCIONALIDADE CONTROLE: PAINEL ADMINISTRATIVO (Corrigido para Promises)
   ============================================================ */

// 1. Rota visual para renderizar a view do Painel ADM
router.get("/painel_adm", function (req, res) {
  res.render("pages/painel_adm");
});

// 2. API de dados que alimenta a tabela do Painel ADM exibindo E-mail e Recado
router.get("/api/suporte", async function (req, res) {
  const query =
    "SELECT id, nome, email, assunto, mensagem, data_envio FROM chamados_suporte ORDER BY data_envio DESC";

  try {
    const [resultados] = await pool.query(query);
    res.status(200).json(resultados);
  } catch (err) {
    console.error("Erro ao buscar chamados no painel ADM:", err);
    return res.status(500).json({ erro: "Erro ao ler dados do banco." });
  }
});

router.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/login");
});

/* ============================================================
   FUNCIONALIDADE: FORMULÁRIO DE DOAÇÃO
   ============================================================ */
router.post(
  "/doacao",
  [
    body("nome")
      .trim()
      .optional({ checkFalsy: true })
      .isLength({ min: 2, max: 100 })
      .withMessage("O nome deve ter entre 2 e 100 caracteres.")
      .escape(),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("O e-mail é obrigatório.")
      .isEmail()
      .withMessage("Informe um e-mail válido (ex: voce@email.com).")
      .normalizeEmail(),
    body("valor")
      .notEmpty()
      .withMessage("O valor da doação é obrigatório.")
      .isFloat({ min: 5 })
      .withMessage("O valor mínimo para doação é R$ 5,00.")
      .toFloat(),
    body("formaPagamento")
      .notEmpty()
      .withMessage("Selecione uma forma de pagamento.")
      .isIn(["pix", "credito", "boleto"])
      .withMessage("Forma de pagamento inválida."),
  ],
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("pages/text", {
        errors: errors.array(),
        old: req.body,
        success: false,
      });
    }

    const { nome, email, valor, formaPagamento } = req.body;
    const query =
      "INSERT INTO doacoes (nome, email, valor, forma_pagamento, data_doacao) VALUES (?, ?, ?, ?, NOW())";

    try {
      await pool.query(query, [
        nome || "Anônimo",
        email,
        valor,
        formaPagamento,
      ]);
      return res.render("pages/text", {
        errors: [],
        old: {},
        success: true,
      });
    } catch (err) {
      console.error("Erro ao salvar doação:", err);
      return res.status(500).render("pages/text", {
        errors: [
          { path: "geral", msg: "Erro interno. Tente novamente em instantes." },
        ],
        old: req.body,
        success: false,
      });
    }
  },
);

/* ============================================================
   CHATBOT (Gemini) — tira dúvidas sobre o site e sobre o tema
   ============================================================ */
router.post("/api/chatbot", async function (req, res) {
  const mensagem = (req.body.mensagem || "").toString().trim();

  if (!mensagem) {
    return res.status(400).json({ erro: "Digite uma mensagem." });
  }
  if (mensagem.length > 1000) {
    return res.status(400).json({ erro: "Mensagem muito longa (máx. 1000 caracteres)." });
  }

  try {
    const { resposta, interactionId } = await perguntarChatbot(
      mensagem,
      req.session.chatInteractionId,
    );
    req.session.chatInteractionId = interactionId;
    res.json({ resposta });
  } catch (error) {
    console.error("Erro no chatbot:", error);
    res.status(500).json({
      erro:
        "Não consegui falar com a IA agora. Se você está em perigo, use o botão de emergência no topo da página.",
    });
  }
});

router.post("/api/chatbot/limpar", function (req, res) {
  req.session.chatInteractionId = null;
  res.json({ ok: true });
});

module.exports = router;
