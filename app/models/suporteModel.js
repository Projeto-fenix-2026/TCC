const pool = require("../../config/pool_conexoes");

const suporteModel = {

    create: async (dados) => {
        /*
        dados json no formato:
            { nome: "nome", email: "email@email.com", assunto: "duvida", mensagem: "texto" }
        */
        try {
            const [resultado] = await pool.query(
                "INSERT INTO chamados_suporte (nome, email, assunto, mensagem, data_envio) VALUES (?, ?, ?, ?, NOW())",
                [dados.nome, dados.email, dados.assunto, dados.mensagem]);
            return resultado;
        } catch (erro) {
            return erro;
        }
    },

    findAll: async () => {
        try {
            const [linhas] = await pool.query(
                "SELECT id, nome, email, assunto, mensagem, data_envio FROM chamados_suporte ORDER BY data_envio DESC");
            return linhas;
        } catch (erro) {
            return erro;
        }
    }

};

module.exports = { suporteModel };
