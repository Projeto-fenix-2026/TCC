var express = require("express");
var router = express.Router();
const pool = require("../../config/pool_conexoes");
const {body, validationResult} = require("express-validator");
var {validarCNPJ, validarCPF } = require("../helpers/validacoes");
const { usuarioModel } = require("../models/usuarioModel");

router.get("/login", function (req, res) {
  res.render("pages/login",{"erros": null, "valores": {"email":"","password":""} ,"retorno":null}); 
});

router.post(
  "/login",
  body("email").isEmail().withMessage('Digite um e-mail válido!'),
  body("password").isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres!'),
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("pages/login", { "erros": errors, "valores": req.body, "retorno": null });
    }
    return res.redirect("/home2");
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
    .optional({ checkFalsy: true })
    .customSanitizer(value => value.replace(/\D/g, ''))
    .isLength({ min: 14, max: 14 }).withMessage('O CNPJ deve ter 14 dígitos!')
    .custom((value) => {
      if (validarCNPJ(value)) {
        return true;
      } else {
        throw new Error('CNPJ inválido!');
      }
    }),
  body("cpf")
    .customSanitizer(value => value.replace(/\D/g, ''))
    .isLength({ min: 11, max: 11 }).withMessage('O CPF deve ter 11 dígitos!')
    .custom((value) => {
      if (validarCPF(value)) {
        return true;
      } else {
        throw new Error('CPF inválido!');
      }
    }),
  body("number")
    .customSanitizer(value => value.replace(/\D/g, ''))
    .isLength({ min: 10, max: 11 }).withMessage('O celular deve ter 10 ou 11 dígitos!'),
  body("password")
    .isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres!'),
  body("confirmPassword")
    .isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres!')
    .custom((value, { req }) => {
      if (value !== req.body.password) throw new Error('As senhas não coincidem!');
      return true;
    }),

  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("pages/cadastro", { retorno: null, "listaErros": errors, "campos": req.body });
    }

    const resultado = await usuarioModel.create({
      nome:     req.body.firstname,
      cpf:      req.body.cpf,
      email:    req.body.email,
      telefone: req.body.number,
      senha:    req.body.password,
      genero:   req.body.gender
    });

    if (resultado.affectedRows) {
      return res.redirect("/login");
    } else {
      return res.render("pages/cadastro", { retorno: null, "listaErros": { errors: [{ msg: "Erro ao cadastrar. Tente novamente." }] }, "campos": req.body });
    }
  }
);



router.get("/usuarios", async function (req, res) {
  const usuarios = await usuarioModel.findAll();
  res.json(usuarios);
});

router.get("/planos", function (req, res) {
  res.render("pages/planos"); 
});
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
  res.render("pages/text"); 
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
router.get("/text", function (req, res) {
  res.render("pages/text"); 
});
router.get("/geolocalizacao", function (req, res) {
  res.render("pages/geolocalizacao"); 
});




module.exports = router;