const pool = require("../../config/pool_conexoes");

const COLUNAS_LISTAGEM = "id_ong, nome, email, telefone, CNPJ, descricao, imagem";

const ongModel = {

    findAll: async () => {
        try {
            const [linhas] = await pool.query(
                `SELECT ${COLUNAS_LISTAGEM} FROM ONG ORDER BY nome`);
            return linhas;
        } catch (erro) {
            return erro;
        }
    },

    findById: async (id) => {
        try {
            const [linhas] = await pool.query(
                `SELECT ${COLUNAS_LISTAGEM} FROM ONG WHERE id_ong = ?`,
                [id]);
            return linhas[0] || null;
        } catch (erro) {
            return null;
        }
    },

    // Só os bytes da imagem — usado pela rota que serve a foto (/ongs/imagem/:id),
    // separado do resto pra não arrastar o LONGBLOB nas listagens.
    findImagem: async (id) => {
        try {
            const [linhas] = await pool.query(
                "SELECT imagem_dados, imagem_mime FROM ONG WHERE id_ong = ?",
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
            const imagem = dados.imagemBuffer ? `/ongs/imagem/${nextId}` : null;
            const [resultado] = await pool.query(
                "INSERT INTO ONG (id_ong, nome, email, telefone, CNPJ, descricao, imagem, imagem_dados, imagem_mime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [nextId, dados.nome, dados.email, dados.telefone, dados.cnpj, dados.descricao || null,
                    imagem, dados.imagemBuffer || null, dados.imagemMime || null]);
            return resultado;
        } catch (erro) {
            return erro;
        }
    },

    update: async (dados) => {
        try {
            // Só mexe na foto se uma nova foi enviada; sem upload novo,
            // mantém a que já estava salva (imagem/imagem_dados intactos).
            if (dados.imagemBuffer) {
                const imagem = `/ongs/imagem/${dados.id}`;
                const [resultado] = await pool.query(
                    "UPDATE ONG SET nome = ?, email = ?, telefone = ?, CNPJ = ?, descricao = ?, imagem = ?, imagem_dados = ?, imagem_mime = ? WHERE id_ong = ?",
                    [dados.nome, dados.email, dados.telefone, dados.cnpj, dados.descricao || null,
                        imagem, dados.imagemBuffer, dados.imagemMime, dados.id]);
                return resultado;
            }
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
