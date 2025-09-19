var express = require("express");
var router = express.Router();
const {body, validationResult} = require("express-validator");

router.get("/", function (req, res) {
  res.render("pages/login",{ "erros": null, "valores": {"email":"","senha":""} ,"retorno":null }); 
});
router.post("/login",
  body("email").isEmail().withMessage("Este email não é válido"),
  body("senha").isLength({ min: 8 }).withMessage("Senha deve ter pelo menos 8 caracteres!"),

  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.render("pages/login", { "erros": errors, "valores":req.body,"retorno":null});
    }

      return res.render("pages/login", { "erros": null, "valores":req.body,"retorno":req.body});
  }
);

router.get("/home", function (req, res) {
  res.render("pages/home"); 
});
router.get("/ongs", function (req, res) {
  res.render("pages/ongs"); 
});
router.get("/index", function (req, res) {
  res.render("pages/index"); 
});

module.exports = router;