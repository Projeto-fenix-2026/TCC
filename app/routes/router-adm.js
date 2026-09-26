var express = require("express");
var router = express.Router();
const multer = require("multer");
const { autenticadoAdm } = require("../helpers/autenticadoAdm");
const admController = require("../controllers/admController");
const ongController = require("../controllers/ongController");

// Guarda a imagem em memória (req.file.buffer) em vez de escrever em
// disco: no Render o disco é apagado a cada reinício/deploy, então a
// foto precisa ir direto pro banco (colunas imagem_dados/imagem_mime).
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 3 * 1024 * 1024 },
});

// ── LOGIN ADMIN ──────────────────────────────────────────────────
router.get("/login", admController.exibirLogin);
router.post("/login", admController.login);
router.get("/logout", admController.logout);

// ── ROTAS PROTEGIDAS ─────────────────────────────────────────────
router.get("/", autenticadoAdm, admController.exibirDashboard);
router.get("/adm-cliente", autenticadoAdm, admController.exibirClientes);

router.get("/adm-ong", autenticadoAdm, ongController.exibirAdmOngs);

router.post(
    "/adm-ong/cadastrar",
    autenticadoAdm,
    upload.single("imagem"),
    ongController.regrasValidacaoOng,
    ongController.cadastrarOng,
);

router.post(
    "/adm-ong/editar",
    autenticadoAdm,
    upload.single("imagem"),
    ongController.regrasValidacaoOng,
    ongController.editarOng,
);

router.post("/adm-ong/excluir", autenticadoAdm, ongController.excluirOng);

module.exports = router;
