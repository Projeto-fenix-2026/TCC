var express = require("express");
var router = express.Router();
const { usuarioModel } = require("../models/usuarioModel");

router.get("/", (req, res)=>{
    res.render("pages/index-adm");
});

router.get("/adm-cliente", async (req, res)=>{
    const usuarios = await usuarioModel.findAll();
    res.render("pages/adm-cliente", { usuarios });
});





module.exports = router;