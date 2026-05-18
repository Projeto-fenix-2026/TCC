const pool = require("../../config/pool_conexoes");

const usuarioModel = {

    findAll: async () => {
        try {
            const [linhas] = await pool.query("SELECT * FROM usuario");
            return linhas;
        } catch (erro) {
            return erro;
        }
    },

    findById: async (id) => {
        try {
            const [linhas] = await pool.query(
                "SELECT * FROM usuario WHERE id_usuario = ?",
                [id]);
            return linhas;
        } catch (erro) {
            return erro;
        }
    },

    create: async (dados) => {
        /*
        dados json no formato:
            {
            nome: "nome",
            cpf: "00000000000",
            email: "email@email.com",
            telefone: "00000000000",
            senha: "senha",
            genero: "Masculino"
            }
        */
        try {
            const [resultado] = await pool.query(
                "INSERT INTO usuario (nome, CPF, email, telefone, senha, genero) VALUES (?, ?, ?, ?, ?, ?)",
                [dados.nome, dados.cpf, dados.email, dados.telefone, dados.senha, dados.genero]);
            return resultado;
        } catch (erro) {
            return erro;
        }
    },

    update: async (dados) => {
        /*
        dados json no formato:
            {
            id: 1,
            nome: "nome",
            email: "email@email.com",
            telefone: "00000000000",
            genero: "Feminino"
            }
        */
        try {
            const [resultado] = await pool.query(
                "UPDATE usuario SET nome = ?, email = ?, telefone = ?, genero = ? WHERE id_usuario = ?",
                [dados.nome, dados.email, dados.telefone, dados.genero, dados.id]);
            return resultado;
        } catch (erro) {
            return erro;
        }
    },

    deleteById: async (id) => {
        try {
            const [resultado] = await pool.query(
                "DELETE FROM usuario WHERE id_usuario = ?",
                [id]);
            return resultado;
        } catch (erro) {
            return erro;
        }
    }

}

module.exports = { usuarioModel };
