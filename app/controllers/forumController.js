const { body, validationResult } = require("express-validator");
const { forumModel } = require("../models/forumModel");

const forumController = {

    exibirForum: (req, res) => {
        res.render("pages/forum");
    },

    listarPosts: async (req, res) => {
        const posts = await forumModel.findAll();
        res.json(posts);
    },

    meusPosts: async (req, res) => {
        const posts = await forumModel.findByUsuario(req.session.usuario.id);
        res.json(posts);
    },

    regrasValidacaoPost: [
        body("titulo")
            .trim()
            .isLength({ min: 5, max: 200 })
            .withMessage("O título deve ter entre 5 e 200 caracteres."),
        body("conteudo")
            .trim()
            .isLength({ min: 10, max: 5000 })
            .withMessage("O texto deve ter entre 10 e 5000 caracteres."),
    ],

    regrasValidacaoNovoPost: [
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
    ],

    criarPost: async (req, res) => {
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

    atualizarPost: async (req, res) => {
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

    excluirPost: async (req, res) => {
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
    },

};

module.exports = forumController;
