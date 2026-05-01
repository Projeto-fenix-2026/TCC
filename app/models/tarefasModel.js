// requisitar o pool de conexões
const pool = require("../../config/pool_conexoes");
// criar um objeto com funções de acesso ao SGBD
const tarefasModel = {

    //select itens ativos
    findAll: async () => {
        try {
            const [linhas] = await pool.query("select * from tarefas where status_tarefa = 1");
            return linhas;
        } catch (erro) {
            return erro;
        }
    },
    //select por id específico
    findById: async (id) => {
        try {
            const [linhas] = await pool.query(
                "select * from tarefas where status_tarefa = 1 and id_tarefa = ?",
                [id]);
            return linhas;
        } catch (erro) {
            return erro;
        }
    },
    //insert
    create: async (dados) => {
        /*
        dados json no formato:
            {
            nome: "nome",
            prazo:"data mysql",
            situacao:"cod situacao"
            }
        */
        try {
            const [resultInsert] = await pool.query(
                "insert into tarefas(`nome_tarefa`,`prazo_tarefa`, " +
                "`situacao_tarefa`) values(?,?,?)",
                [dados.nome, dados.prazo, dados.situacao]);
            return resultInsert;
        } catch (erro) {
            return erro;
        }

    },

    // update :
    update: async (dados) => {
        /*
        dados json no formato:
            {
            id: 3
            nome: "nome",
            prazo:"data mysql",
            situacao:"cod situacao"
            }
        */
        try {
            const [resulUpdate] = await pool.query(
                "update tarefas set `nome_tarefa`= ?,`prazo_tarefa`= ?,  " +
                "`situacao_tarefa`= ? where id_tarefa = ?",
                [dados.nome, dados.prazo, dados.situacao, dados.id]);
            return resulUpdate;
        } catch (erro) {
            return erro;
        }
    }

    // deleteLogico :
    // deleteFisico :

}


//exportar este objeto como um módulo js
module.exports = { tarefasModel }
// uso de chave torna obrigatório o uso do nome indicado