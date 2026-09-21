const pool = require("../../config/pool_conexoes");

const forumModel = {
    findAll: async () => {
        try {
            const [linhas] = await pool.query(
                `SELECT p.id_post, p.categoria, p.titulo, p.conteudo, p.criado_em, p.atualizado_em,
                        p.id_usuario, u.nome AS autor_nome, u.foto_url AS autor_foto
                 FROM forum_posts p
                 JOIN usuario u ON u.id_usuario = p.id_usuario
                 ORDER BY p.criado_em DESC`);
            return linhas;
        } catch (erro) {
            return erro;
        }
    },

    findByUsuario: async (id_usuario) => {
        try {
            const [linhas] = await pool.query(
                `SELECT id_post, categoria, titulo, conteudo, criado_em, atualizado_em
                 FROM forum_posts WHERE id_usuario = ? ORDER BY criado_em DESC`,
                [id_usuario]);
            return linhas;
        } catch (erro) {
            return erro;
        }
    },

    findById: async (id_post) => {
        try {
            const [linhas] = await pool.query(
                "SELECT * FROM forum_posts WHERE id_post = ?",
                [id_post]);
            return linhas[0] || null;
        } catch (erro) {
            return null;
        }
    },

    create: async (dados) => {
        /*
        dados json no formato:
            { id_usuario: 1, categoria: "relatos", titulo: "titulo", conteudo: "texto" }
        */
        try {
            const [resultado] = await pool.query(
                "INSERT INTO forum_posts (id_usuario, categoria, titulo, conteudo) VALUES (?, ?, ?, ?)",
                [dados.id_usuario, dados.categoria, dados.titulo, dados.conteudo]);
            return resultado;
        } catch (erro) {
            return erro;
        }
    },

    update: async (dados) => {
        try {
            const [resultado] = await pool.query(
                "UPDATE forum_posts SET categoria = ?, titulo = ?, conteudo = ? WHERE id_post = ? AND id_usuario = ?",
                [dados.categoria, dados.titulo, dados.conteudo, dados.id_post, dados.id_usuario]);
            return resultado;
        } catch (erro) {
            return erro;
        }
    },

    deleteById: async (id_post, id_usuario) => {
        try {
            const [resultado] = await pool.query(
                "DELETE FROM forum_posts WHERE id_post = ? AND id_usuario = ?",
                [id_post, id_usuario]);
            return resultado;
        } catch (erro) {
            return erro;
        }
    },
};

module.exports = { forumModel };
