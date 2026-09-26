const pool = require("../../config/pool_conexoes");

const doacaoModel = {

    create: async (dados) => {
        /*
        dados json no formato:
            { nome: "nome", email: "email@email.com", valor: 10.5, formaPagamento: "pix" }
        */
        try {
            const [resultado] = await pool.query(
                "INSERT INTO doacoes (nome, email, valor, forma_pagamento, data_doacao) VALUES (?, ?, ?, ?, NOW())",
                [dados.nome || "Anônimo", dados.email, dados.valor, dados.formaPagamento]);
            return resultado;
        } catch (erro) {
            return erro;
        }
    }

};

module.exports = { doacaoModel };
