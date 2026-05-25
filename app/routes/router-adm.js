var express = require("express");
var router = express.Router();
const path = require("path");
const multer = require("multer");
const { usuarioModel } = require("../models/usuarioModel");
const { ongModel } = require("../models/ongModel");

const storage = multer.diskStorage({
    destination: path.join(__dirname, "../../app/public/uploads/ongs"),
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 3 * 1024 * 1024 } });

router.get("/", (req, res) => {
    res.render("pages/index-adm");
});

router.get("/adm-cliente", async (req, res) => {
    const usuarios = await usuarioModel.findAll();
    res.render("pages/adm-cliente", { usuarios });
});

router.get("/adm-ong", async (req, res) => {
    const ongs = await ongModel.findAll();
    res.render("pages/adm-ong", { ongs });
});

router.post("/adm-ong/cadastrar", upload.single("imagem"), async (req, res) => {
    const { nome, email, telefone, cnpj, descricao } = req.body;
    const imagem = req.file ? "/uploads/ongs/" + req.file.filename : null;
    await ongModel.create({ nome, email, telefone, cnpj, descricao, imagem });
    res.redirect("/adm/adm-ong");
});

router.post("/adm-ong/editar", upload.single("imagem"), async (req, res) => {
    const { id, nome, email, telefone, cnpj, descricao, imagemAtual } = req.body;
    const imagem = req.file ? "/uploads/ongs/" + req.file.filename : (imagemAtual || null);
    await ongModel.update({ id, nome, email, telefone, cnpj, descricao, imagem });
    res.redirect("/adm/adm-ong");
});

router.post("/adm-ong/excluir", async (req, res) => {
    const { id } = req.body;
    await ongModel.deleteById(id);
    res.redirect("/adm/adm-ong");
});

module.exports = router;
