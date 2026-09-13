const pool = require("../../config/pool_conexoes");

const socorroModel = {
    findByUsuario: async (id_usuario) => {
        try {
            const [linhas] = await pool.query(
                `SELECT id, nome, numero, categoria, icone, descricao, criado_em
                 FROM numeros_socorro WHERE id_usuario = ? ORDER BY criado_em ASC`,
                [id_usuario]);
            return linhas;
        } catch (erro) {
            return erro;
        }
    },

    countByUsuario: async (id_usuario) => {
        try {
            const [linhas] = await pool.query(
                "SELECT COUNT(*) AS total FROM numeros_socorro WHERE id_usuario = ?",
                [id_usuario]);
            return linhas[0].total;
        } catch (erro) {
            return 0;
        }
    },

    findById: async (id) => {
        try {
            const [linhas] = await pool.query(
                "SELECT * FROM numeros_socorro WHERE id = ?",
                [id]);
            return linhas[0] || null;
        } catch (erro) {
            return null;
        }
    },

    create: async (dados) => {
        /*
        dados json no formato:
            { id_usuario: 1, nome: "nome", numero: "180", categoria: "Delegacia", icone: "phone", descricao: "" }
        */
        try {
            const [resultado] = await pool.query(
                "INSERT INTO numeros_socorro (id_usuario, nome, numero, categoria, icone, descricao) VALUES (?, ?, ?, ?, ?, ?)",
                [dados.id_usuario, dados.nome, dados.numero, dados.categoria || null, dados.icone || null, dados.descricao || null]);
            return resultado;
        } catch (erro) {
            return erro;
        }
    },

    deleteById: async (id, id_usuario) => {
        try {
            const [resultado] = await pool.query(
                "DELETE FROM numeros_socorro WHERE id = ? AND id_usuario = ?",
                [id, id_usuario]);
            return resultado;
        } catch (erro) {
            return erro;
        }
    },
};

module.exports = { socorroModel };
