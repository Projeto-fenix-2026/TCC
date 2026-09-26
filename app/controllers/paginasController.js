const paginasController = {

    exibirText: (req, res) => {
        res.render("pages/text");
    },

    exibirHome2: (req, res) => {
        res.render("pages/home2");
    },

    exibirPlanos: (req, res) => {
        res.render("pages/planos");
    },

    exibirFormsDoacao: (req, res) => {
        res.render("pages/forms_doacao");
    },

    exibirLoginProfissionais: (req, res) => {
        res.render("pages/login_profissionais");
    },

    exibirPerfilProfissional: (req, res) => {
        res.render("pages/perfil_profissional");
    },

    exibirPerfilOng: (req, res) => {
        res.render("pages/perfil_ong");
    },

    exibirDireitos: (req, res) => {
        res.render("pages/direitos");
    },

    exibirSobreNos: (req, res) => {
        res.render("pages/sobre_nos");
    },

    exibirCarrossel: (req, res) => {
        res.render("pages/carrossel");
    },

    exibirContato: (req, res) => {
        res.render("pages/contato");
    },

    exibirTiposViolencia: (req, res) => {
        res.render("pages/tipos_violencia");
    },

};

module.exports = paginasController;
