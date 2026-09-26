const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { usuarioModel } = require("../models/usuarioModel");
const { validarCNPJ, validarCPF } = require("../helpers/validacoes");
const { enviarEmail } = require("../util/email");
const templateAtivarConta = require("../util/email-ativar-conta");

const usuarioController = {

    // ── LOGIN ────────────────────────────────────────────────────
    regrasValidacaoLogin: [
        body("email").isEmail().withMessage("Digite um e-mail válido!"),
        body("password")
            .isLength({ min: 6 })
            .withMessage("A senha deve ter pelo menos 6 caracteres!"),
    ],

    exibirLogin: (req, res) => {
        res.render("pages/login", {
            erros: null,
            valores: { email: "", password: "" },
            retorno: null,
        });
    },

    login: async (req, res) => {
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
            usuario && usuario.senha && bcrypt.compareSync(req.body.password, usuario.senha);
        if (!senhaCorreta) {
            return res.render("pages/login", {
                erros: null,
                valores: req.body,
                retorno: { tipo: "erro", msg: "E-mail ou senha incorretos." },
            });
        }

        if (!usuario.status_usuario) {
            return res.render("pages/login", {
                erros: null,
                valores: req.body,
                retorno: {
                    tipo: "erro",
                    msg: "Sua conta ainda não foi ativada. Verifique o e-mail que enviamos para você.",
                },
            });
        }

        req.session.usuario = {
            id: usuario.id_usuario,
            nome: usuario.nome,
            email: usuario.email,
            foto_url: usuario.foto_url || null,
        };
        return res.redirect("/text");
    },

    logout: (req, res) => {
        req.session.destroy();
        res.redirect("/login");
    },

    // ── LOGIN COM GOOGLE ─────────────────────────────────────────
    googleCallback: (req, res) => {
        const usuario = req.user;
        req.session.usuario = {
            id: usuario.id_usuario,
            nome: usuario.nome,
            email: usuario.email,
            foto_url: usuario.foto_url || null,
        };

        if (usuario.perfil_incompleto) {
            return res.redirect("/completar-cadastro");
        }
        return res.redirect("/text");
    },

    // ── COMPLETAR CADASTRO (contas criadas pelo Google) ─────────
    exibirCompletarCadastro: async (req, res) => {
        const linhas = await usuarioModel.findById(req.session.usuario.id);
        const usuario = linhas[0];
        if (usuario && usuario.CPF && usuario.telefone) {
            return res.redirect("/text");
        }
        res.render("pages/completar-cadastro", {
            listaErros: null,
            campos: { cpf: "", number: "" },
        });
    },

    regrasValidacaoCompletarCadastro: [
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
    ],

    completarCadastro: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render("pages/completar-cadastro", {
                listaErros: errors,
                campos: req.body,
            });
        }

        const resultado = await usuarioModel.completarCadastro({
            id: req.session.usuario.id,
            cpf: req.body.cpf,
            telefone: req.body.number,
        });

        if (resultado.affectedRows) {
            return res.redirect("/text");
        }

        const mensagem =
            resultado && resultado.code === "ER_DUP_ENTRY"
                ? "Este CPF já está cadastrado em outra conta."
                : "Erro ao salvar. Tente novamente.";
        return res.render("pages/completar-cadastro", {
            listaErros: { errors: [{ msg: mensagem }] },
            campos: req.body,
        });
    },

    // ── CADASTRO ─────────────────────────────────────────────────
    exibirCadastro: (req, res) => {
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
    },

    regrasValidacaoCadastro: [
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
    ],

    cadastrar: async (req, res) => {
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
            const token = jwt.sign(
                { userId: resultado.insertId },
                process.env.SECRET_KEY,
                { expiresIn: "1d" },
            );
            const html = templateAtivarConta(process.env.URL_BASE, token);
            enviarEmail(req.body.email, "Ative sua conta - Fênix", null, html);

            return res.render("pages/login", {
                erros: null,
                valores: { email: req.body.email, password: "" },
                retorno: {
                    tipo: "sucesso",
                    msg: "Cadastro realizado! Enviamos um e-mail para você ativar sua conta.",
                },
            });
        } else {
            const mensagem =
                resultado && resultado.code === "ER_DUP_ENTRY"
                    ? "Este e-mail ou CPF já está cadastrado."
                    : "Erro ao cadastrar. Tente novamente.";
            return res.render("pages/cadastro", {
                retorno: null,
                listaErros: {
                    errors: [{ msg: mensagem }],
                },
                campos: req.body,
            });
        }
    },

    // ── ATIVAÇÃO DE CONTA ────────────────────────────────────────
    ativarConta: async (req, res) => {
        const renderLogin = (retorno) =>
            res.render("pages/login", {
                erros: null,
                valores: { email: "", password: "" },
                retorno,
            });

        try {
            const decoded = jwt.verify(req.query.token, process.env.SECRET_KEY);
            const linhas = await usuarioModel.findById(decoded.userId);
            const usuario = linhas[0];

            if (!usuario) {
                return renderLogin({
                    tipo: "erro",
                    msg: "Usuário não encontrado.",
                });
            }

            await usuarioModel.ativarConta(usuario.id_usuario);

            return renderLogin({
                tipo: "sucesso",
                msg: "Conta ativada! Use seu e-mail e senha para acessar o seu perfil.",
            });
        } catch (erro) {
            return renderLogin({
                tipo: "erro",
                msg: "Link de ativação inválido ou expirado.",
            });
        }
    },

    // ── LISTAGEM ─────────────────────────────────────────────────
    listarUsuarios: async (req, res) => {
        const usuarios = await usuarioModel.findAll();
        res.json(usuarios);
    },

    // ── PÁGINAS DO PERFIL ────────────────────────────────────────
    exibirPerfil: async (req, res) => {
        const linhas = await usuarioModel.findById(req.session.usuario.id);
        const usuario = linhas[0] || null;
        res.render("pages/perfil_usuario", { usuario });
    },

    exibirConfiguracoes: async (req, res) => {
        const linhas = await usuarioModel.findById(req.session.usuario.id);
        const usuario = linhas[0] || null;
        res.render("pages/configuracoes", { usuario });
    },

    // ── API PERFIL ───────────────────────────────────────────────
    dadosPerfil: async (req, res) => {
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
    },

    atualizarDados: async (req, res) => {
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
    },

    atualizarEmail: async (req, res) => {
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
    },

    atualizarFoto: async (req, res) => {
        if (!req.file)
            return res.status(400).json({ mensagem: "Nenhuma imagem enviada." });
        const foto_url = "/uploads/fotos/" + req.file.filename;
        await usuarioModel.updateFoto({ id: req.session.usuario.id, foto_url });
        req.session.usuario.foto_url = foto_url;
        res.json({ foto_url });
    },

    removerFoto: async (req, res) => {
        await usuarioModel.updateFoto({ id: req.session.usuario.id, foto_url: null });
        req.session.usuario.foto_url = null;
        res.json({ ok: true });
    },

    atualizarSenha: async (req, res) => {
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
    },

    excluirConta: async (req, res) => {
        const resultado = await usuarioModel.deleteById(req.session.usuario.id);
        if (!resultado.affectedRows) {
            return res
                .status(500)
                .json({ mensagem: "Erro ao excluir a conta. Tente novamente." });
        }
        req.session.destroy(function () {
            res.json({ ok: true });
        });
    },

};

module.exports = usuarioController;
