var express = require("express");
var router = express.Router();


router.get("/", (req, res)=>{
    res.render("pages/index-adm");
});

router.get("/adm-cliente", (req, res)=>{
    res.render("pages/adm-cliente");
});





module.exports = router;