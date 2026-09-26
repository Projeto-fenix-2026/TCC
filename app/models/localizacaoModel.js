const pool = require("../../config/pool_conexoes");

const localizacaoModel = {

    create: async (dados) => {
        /*
        dados json no formato:
            { latitude: -23.55, longitude: -46.63 }
        */
        try {
            const [resultado] = await pool.query(
                "INSERT INTO historico_localizacao (latitude, longitude) VALUES (?, ?)",
                [dados.latitude, dados.longitude]);
            return resultado;
        } catch (erro) {
            return erro;
        }
    }

};

module.exports = { localizacaoModel };
