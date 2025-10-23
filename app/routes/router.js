var express = require("express");
var router = express.Router();
const {body, validationResult} = require("express-validator");
var {validarCNPJ, validarCPF } = require("../helpers/validacoes");

router.get("/login", function (req, res) {
  res.render("pages/login",{"erros": null, "valores": {"email":"","password":""} ,"retorno":null}); 
});

router.post(
  "/login",
  body("email").isEmail(),
  body("password").isLength({ min: 6}),
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.render("pages/login", { "erros": errors, "valores":req.body,"retorno":null});
    }

      return res.render("pages/login", { "erros": null, "valores":req.body,"retorno":req.body});
  }
);



router.get("/cadastro", function (req, res) {
  res.render("pages/cadastro",{"listaErros": null, "campos": {"firstname":"", "email":"", "cpf":"","cnpj":"", "number":"","password":"","confirmPassword":""} ,"retorno":null}); 
});
router.post(
  "/cadastro",
  body("firstname")
    .isLength({ min: 2 }).withMessage('O nome deve ter minimo 2 caracteres!'),
  body("email")
    .isEmail().withMessage('O e-mail deve ser válido!'),
  body("cnpj")
    .isLength({ min: 18, max: 18 }).withMessage('O CNPJ tem 18 caracteres!')
    .custom((value) => {
      if (validarCNPJ(value)) {
        return true;
      } else {
        throw new Error('CNPJ inválido!');
      }
    }),
     body("cpf")
    .isLength({ min: 11, max: 11 }).withMessage('O CPF tem 11 caracteres!')
    .custom((value) => {
      if (validarCPF(value)) {
        return true;
      } else {
        throw new Error('CPF inválido!');
      }
    }),
    body("number")
    .isLength({ min: 11, max: 11 }).withMessage('O CPF tem 11 caracteres!'),
    body("password")
    .isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres!'),
    body("confirmPassword")
    .isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres!'),

  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.render("pages/cadastro", { retorno: null, "listaErros": errors, "campos": req.body });
    }
    return res.render("pages/cadastro", { retorno: req.body, "listaErros": errors, "campos": req.body });
  }
);



router.get("/forms_doacao", function (req, res) {
  res.render("pages/forms_doacao"); 
});
router.get("/ongs", function (req, res) {
  res.render("pages/ongs"); 
});
router.get("/ong_page", function (req, res) {
  res.render("pages/ong_page"); 
});
router.get("/", function (req, res) {
  res.render("pages/home"); 
});
router.get("/home2", function (req, res) {
  res.render("pages/home2"); 
});
router.get("/login_profissionais", function (req, res) {
  res.render("pages/login_profissionais"); 
});

router.get("/perfil_profissional", function (req, res) {
  res.render("pages/perfil_profissional"); 
});
router.get("/perfil_ong", function (req, res) {
  res.render("pages/perfil_ong"); 
});
router.get("/perfil_usuario", function (req, res) {
  res.render("pages/perfil_usuario"); 
});
router.get("/denuncia", function (req, res) {
  res.render("pages/denuncia"); 
});
router.get("/sobre_nos", function (req, res) {
  res.render("pages/sobre_nos"); 
});
router.get("/carrossel", function (req, res) {
  res.render("pages/carrossel"); 
});
router.get("/contato", function (req, res) {
  res.render("pages/contato"); 
});
router.get("/login", function (req, res) {
  res.render("pages/login"); 
});


module.exports = router;










module.exports = router;