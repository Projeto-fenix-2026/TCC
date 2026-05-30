function autenticadoAdm(req, res, next) {
    if (req.session && req.session.admin) {
        return next();
    }
    return res.redirect("/adm/login");
}

module.exports = { autenticadoAdm };
