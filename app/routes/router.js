var express = require("express");
var router = express.Router();
const path = require("path");
const multer = require("multer");
const passport = require("../../config/passport");
const { autenticado } = require("../helpers/autenticado");

const usuarioController = require("../controllers/usuarioController");
const forumController = require("../controllers/forumController");
const socorroController = require("../controllers/socorroController");
const ongController = require("../controllers/ongController");
const chatbotController = require("../controllers/chatbotController");
const suporteController = require("../controllers/suporteController");
const doacaoController = require("../controllers/doacaoController");
const localizacaoController = require("../controllers/localizacaoController");
const paginasController = require("../controllers/paginasController");

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

/* ============================================================
   ROTAS DE AUTENTICAÇÃO: LOGIN
   ============================================================ */
router.get("/login", usuarioController.exibirLogin);
router.post(
  "/login",
  usuarioController.regrasValidacaoLogin,
  usuarioController.login,
);

/* ============================================================
   ROTAS DE AUTENTICAÇÃO: LOGIN COM GOOGLE
   ============================================================ */
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  usuarioController.googleCallback,
);

// Conta criada pelo Google ainda não tem CPF/telefone (exigidos pelo
// resto do site) — pede esses dados antes de liberar o restante.
router.get(
  "/completar-cadastro",
  autenticado,
  usuarioController.exibirCompletarCadastro,
);
router.post(
  "/completar-cadastro",
  autenticado,
  usuarioController.regrasValidacaoCompletarCadastro,
  usuarioController.completarCadastro,
);

/* ============================================================
   ROTAS DE AUTENTICAÇÃO: CADASTRO
   ============================================================ */
router.get("/cadastro", usuarioController.exibirCadastro);
router.post(
  "/cadastro",
  usuarioController.regrasValidacaoCadastro,
  usuarioController.cadastrar,
);

/* ============================================================
   ROTA DE ATIVAÇÃO DE CONTA
   ============================================================ */
router.get("/ativar-conta", usuarioController.ativarConta);

/* ============================================================
   ROTAS DE CONSULTA E RENDERIZAÇÃO DE PÁGINAS SEMÂNTICAS
   ============================================================ */
router.get("/usuarios", usuarioController.listarUsuarios);

// rotas públicas
router.get("/", paginasController.exibirText);
router.get("/text", paginasController.exibirText);

router.get("/forum", autenticado, forumController.exibirForum);

// ── API FÓRUM ─────────────────────────────────────────────────
router.get("/api/forum/posts", autenticado, forumController.listarPosts);
router.get("/api/forum/meus-posts", autenticado, forumController.meusPosts);

router.post(
  "/api/forum/posts",
  autenticado,
  forumController.regrasValidacaoNovoPost,
  forumController.criarPost,
);

router.put(
  "/api/forum/posts/:id",
  autenticado,
  forumController.regrasValidacaoPost,
  forumController.atualizarPost,
);

router.delete("/api/forum/posts/:id", autenticado, forumController.excluirPost);

// rotas protegidas — exigem login
router.get("/home2", paginasController.exibirHome2);
router.get("/planos", paginasController.exibirPlanos);
router.get("/forms_doacao", paginasController.exibirFormsDoacao);
router.get("/ongs", autenticado, ongController.exibirOngs);

router.get("/ongs/dados", autenticado, ongController.dadosOngs);
router.get("/ong_page", autenticado, ongController.exibirOng);

// Serve a foto da ONG direto do banco (imagem_dados) — não do disco,
// que no Render é apagado a cada reinício/deploy.
router.get("/ongs/imagem/:id", autenticado, ongController.imagem);

router.get("/login_profissionais", paginasController.exibirLoginProfissionais);
router.get("/perfil_profissional", paginasController.exibirPerfilProfissional);
router.get("/perfil_ong", paginasController.exibirPerfilOng);
router.get("/perfil_usuario", autenticado, usuarioController.exibirPerfil);

// ── API PERFIL ────────────────────────────────────────────────
router.get("/api/perfil", autenticado, usuarioController.dadosPerfil);
router.put("/api/perfil/dados", autenticado, usuarioController.atualizarDados);
router.put("/api/perfil/email", autenticado, usuarioController.atualizarEmail);

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
  usuarioController.atualizarFoto,
);

router.delete("/api/perfil/foto", autenticado, usuarioController.removerFoto);
router.put("/api/perfil/senha", autenticado, usuarioController.atualizarSenha);
router.delete("/api/perfil/conta", autenticado, usuarioController.excluirConta);

// ── API NÚMEROS DE SOCORRO (perfil + botão de emergência) ──────
router.get("/api/socorro", autenticado, socorroController.listarContatos);

router.post(
  "/api/socorro",
  autenticado,
  socorroController.regrasValidacaoContato,
  socorroController.criarContato,
);

router.delete("/api/socorro/:id", autenticado, socorroController.excluirContato);

router.get("/direitos", paginasController.exibirDireitos);
router.get("/sobre_nos", paginasController.exibirSobreNos);
router.get("/carrossel", paginasController.exibirCarrossel);
router.get("/contato", paginasController.exibirContato);
router.get("/geolocalizacao", autenticado, localizacaoController.exibirGeolocalizacao);
router.get("/tipos_violencia", paginasController.exibirTiposViolencia);

router.get("/configuracoes", autenticado, usuarioController.exibirConfiguracoes);

/* ============================================================
   FUNCIONALIDADE SEGURANÇA: GEOLOCALIZAÇÃO
   ============================================================ */
router.post("/api/salvar-localizacao", localizacaoController.salvarLocalizacao);

/* ============================================================
   FUNCIONALIDADE: CENTRAL DE CONTATO E SUPORTE
   ============================================================ */
router.post(
  "/api/suporte",
  suporteController.regrasValidacaoSuporte,
  suporteController.enviarSuporte,
);

/* ============================================================
   FUNCIONALIDADE CONTROLE: PAINEL ADMINISTRATIVO
   ============================================================ */
router.get("/painel_adm", suporteController.exibirPainelAdm);
router.get("/api/suporte", suporteController.listarSuporte);

router.get("/logout", usuarioController.logout);

/* ============================================================
   FUNCIONALIDADE: FORMULÁRIO DE DOAÇÃO
   ============================================================ */
router.post(
  "/doacao",
  doacaoController.regrasValidacaoDoacao,
  doacaoController.doar,
);

/* ============================================================
   CHATBOT (Gemini) — tira dúvidas sobre o site e sobre o tema
   ============================================================ */
router.post("/api/chatbot", chatbotController.enviarMensagem);
router.post("/api/chatbot/limpar", chatbotController.limparConversa);

module.exports = router;
