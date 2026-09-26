const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { usuarioModel } = require("../app/models/usuarioModel");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.URL_BASE}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails && profile.emails[0] && profile.emails[0].value;
        const nome = profile.displayName;
        const foto_url = profile.photos && profile.photos[0] && profile.photos[0].value;

        if (!email) {
          return done(new Error("A conta Google não retornou um e-mail."));
        }

        // 1) já logou com essa conta Google antes
        let usuario = await usuarioModel.findByGoogleId(googleId);

        // 2) primeira vez pelo Google, mas o e-mail já tem cadastro tradicional -> vincula
        if (!usuario) {
          const existente = await usuarioModel.findByEmail(email);
          if (existente) {
            await usuarioModel.vincularGoogleId(existente.id_usuario, googleId);
            usuario = existente;
          }
        }

        // 3) ninguém com esse google_id nem esse e-mail -> cria conta nova (perfil incompleto)
        if (!usuario) {
          const resultado = await usuarioModel.createGoogle({
            nome,
            email,
            googleId,
            foto_url,
          });
          usuario = {
            id_usuario: resultado.insertId,
            nome,
            email,
            CPF: null,
            telefone: null,
            foto_url,
          };
        }

        usuario.perfil_incompleto = !usuario.CPF || !usuario.telefone;
        return done(null, usuario);
      } catch (erro) {
        return done(erro);
      }
    },
  ),
);

module.exports = passport;
