const bcrypt = require("bcryptjs");
const { usuarioModel } = require("../models/usuarioModel");
const { ongModel } = require("../models/ongModel");

const admController = {

    exibirLogin: (req, res) => {
        if (req.session.admin) return res.redirect("/adm");
        res.render("pages/login-adm", { erro: null });
    },

    login: async (req, res) => {
        const { email, senha } = req.body;
        const usuario = await usuarioModel.findByEmail(email);
        if (!usuario || !usuario.is_admin) {
            return res.render("pages/login-adm", { erro: "E-mail ou senha incorretos." });
        }
        const senhaCorreta = usuario.senha && bcrypt.compareSync(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.render("pages/login-adm", { erro: "E-mail ou senha incorretos." });
        }
        req.session.admin = { id: usuario.id_usuario, nome: usuario.nome, email: usuario.email, foto_url: usuario.foto_url || null };
        req.session.usuario = { id: usuario.id_usuario, nome: usuario.nome, email: usuario.email, foto_url: usuario.foto_url || null };
        res.redirect("/adm");
    },

    logout: (req, res) => {
        req.session.admin = null;
        res.redirect("/adm/login");
    },

    exibirDashboard: async (req, res) => {
        const usuarios = await usuarioModel.findAll();
        const ongs = await ongModel.findAll();
        const totalUsuarios = usuarios.length;
        const totalOngs = ongs.length;
        const semFoto = usuarios.filter(u => !u.foto_url).length;
        const recentes = [...usuarios].reverse().slice(0, 5);
        res.render("pages/index-adm", { totalUsuarios, totalOngs, semFoto, recentes, admin: req.session.admin });
    },

    exibirClientes: async (req, res) => {
        const usuarios = await usuarioModel.findAll();
        res.render("pages/adm-cliente", { usuarios, admin: req.session.admin });
    },

};

module.exports = admController;
