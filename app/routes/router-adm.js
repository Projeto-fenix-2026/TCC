var express = require("express");
var router = express.Router();
const { usuarioModel } = require("../models/usuarioModel");
const { ongModel } = require("../models/ongModel");

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

router.post("/adm-ong/cadastrar", async (req, res) => {
    const { nome, email, telefone, cnpj } = req.body;
    await ongModel.create({ nome, email, telefone, cnpj });
    res.redirect("/adm/adm-ong");
});

router.post("/adm-ong/editar", async (req, res) => {
    const { id, nome, email, telefone, cnpj } = req.body;
    await ongModel.update({ id, nome, email, telefone, cnpj });
    res.redirect("/adm/adm-ong");
});

router.post("/adm-ong/excluir", async (req, res) => {
    const { id } = req.body;
    await ongModel.deleteById(id);
    res.redirect("/adm/adm-ong");
});

module.exports = router;
