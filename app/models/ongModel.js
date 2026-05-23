const pool = require("../../config/pool_conexoes");

const ongModel = {

    findAll: async () => {
        try {
            const [linhas] = await pool.query("SELECT * FROM ONG ORDER BY nome");
            return linhas;
        } catch (erro) {
            return erro;
        }
    },

    findById: async (id) => {
        try {
            const [linhas] = await pool.query(
                "SELECT * FROM ONG WHERE id_ong = ?",
                [id]);
            return linhas[0] || null;
        } catch (erro) {
            return null;
        }
    },

    create: async (dados) => {
        try {
            const [maxResult] = await pool.query(
                "SELECT COALESCE(MAX(id_ong), 0) + 1 AS next_id FROM ONG");
            const nextId = maxResult[0].next_id;
            const [resultado] = await pool.query(
                "INSERT INTO ONG (id_ong, nome, email, telefone, CNPJ, descricao) VALUES (?, ?, ?, ?, ?, ?)",
                [nextId, dados.nome, dados.email, dados.telefone, dados.cnpj, dados.descricao || null]);
            return resultado;
        } catch (erro) {
            return erro;
        }
    },

    update: async (dados) => {
        try {
            const [resultado] = await pool.query(
                "UPDATE ONG SET nome = ?, email = ?, telefone = ?, CNPJ = ?, descricao = ? WHERE id_ong = ?",
                [dados.nome, dados.email, dados.telefone, dados.cnpj, dados.descricao || null, dados.id]);
            return resultado;
        } catch (erro) {
            return erro;
        }
    },

    deleteById: async (id) => {
        try {
            const [resultado] = await pool.query(
                "DELETE FROM ONG WHERE id_ong = ?",
                [id]);
            return resultado;
        } catch (erro) {
            return erro;
        }
    }

};

module.exports = { ongModel };
